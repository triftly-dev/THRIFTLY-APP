<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Browsershot\Browsershot;
use Symfony\Component\DomCrawler\Crawler;
use Illuminate\Support\Facades\Log;

class ScraperController extends Controller
{
    /**
     * Scrape Facebook Marketplace listing data.
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function scrapeFacebookMarketplace(Request $request)
    {
        $request->validate([
            'url' => 'required|url'
        ]);

        $url = $request->input('url');

        // Pattern validation: Terima semua link FB karena URL bisa berupa shortlink (/share/ atau fb.me)
        if (!preg_match('/(facebook\.com|fb\.com|fb\.me|m\.facebook\.com)/i', $url)) {
            return response()->json([
                'success' => false,
                'message' => 'Link-nya bukan dari Facebook. Pastikan menggunakan link dari Facebook Marketplace.'
            ], 400);
        }

        try {
            // Setup Browsershot
            // We use common user agent to avoid being blocked immediately
            $html = Browsershot::url($url)
                ->userAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
                ->waitUntilNetworkIdle()
                ->timeout(30)
                ->bodyHtml();

            if (empty($html)) {
                throw new \Exception("Empty HTML returned from Browsershot");
            }

            $crawler = new Crawler($html);

            $data = [
                'title' => '',
                'description' => '',
                'price' => '',
                'condition' => '',
                'location' => '',
                'category' => '',
                'images' => [],
                'source_url' => $url
            ];

            // 1. Try to extract from JSON-LD (Usually the most reliable)
            try {
                $jsonLdScripts = $crawler->filter('script[type="application/ld+json"]');
                $jsonLdScripts->each(function (Crawler $node) use (&$data) {
                    $json = json_decode($node->text(), true);
                    if ($json && isset($json['@type']) && $json['@type'] === 'Product') {
                        if (empty($data['title'])) $data['title'] = $json['name'] ?? '';
                        if (empty($data['description'])) $data['description'] = $json['description'] ?? '';
                        if (empty($data['price'])) $data['price'] = $json['offers']['price'] ?? '';
                        if (empty($data['images']) && isset($json['image'])) {
                            $data['images'] = is_array($json['image']) ? array_slice($json['image'], 0, 5) : [$json['image']];
                        }
                    }
                });
            } catch (\Exception $e) {
                Log::warning("JSON-LD extraction failed: " . $e->getMessage());
            }

            // 2. Fallback to Meta Tags (OG Tags)
            if (empty($data['title'])) {
                try {
                    $data['title'] = $crawler->filter('meta[property="og:title"]')->attr('content') ?? '';
                } catch (\Exception $e) {}
            }
            
            if (empty($data['description'])) {
                try {
                    $data['description'] = $crawler->filter('meta[property="og:description"]')->attr('content') ?? '';
                } catch (\Exception $e) {}
            }

            if (empty($data['images'])) {
                try {
                    $ogImage = $crawler->filter('meta[property="og:image"]')->attr('content');
                    if ($ogImage) $data['images'][] = $ogImage;
                } catch (\Exception $e) {}
            }

            // 3. Fallback to DOM Selectors for Price and Location (Facebook specific)
            // Note: These selectors are prone to change by FB
            if (empty($data['price'])) {
                try {
                    // Try to find text that looks like currency
                    $priceText = $crawler->filter('span:contains("Rp"), span:contains("IDR")')->first()->text();
                    $data['price'] = preg_replace('/[^0-9]/', '', $priceText);
                } catch (\Exception $e) {}
            }

            // Clean up and mapping
            $data['title'] = str_replace(' | Facebook', '', $data['title']);
            
            return response()->json([
                'success' => true,
                'data' => $data
            ]);

        } catch (\Exception $e) {
            Log::error('Scraping Error for URL [' . $url . ']: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data dari listing. Listing mungkin sudah dihapus atau bersifat privat.'
            ], 422);
        }
    }
}
