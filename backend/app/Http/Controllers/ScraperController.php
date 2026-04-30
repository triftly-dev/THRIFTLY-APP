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
            // Setup Browsershot dengan trik "Penyamaran Facebook/WhatsApp Crawler"
            $html = Browsershot::url($url)
                ->userAgent('facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)')
                ->windowSize(1920, 1080)
                ->setOption('args', ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'])
                ->waitUntilNetworkIdle()
                ->timeout(60) // Ditambah agar lebih sabar menunggu render FB
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

    /**
     * Scrape Tokopedia product data.
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function scrapeTokopedia(Request $request)
    {
        $request->validate([
            'url' => 'required|url'
        ]);

        $url = $request->input('url');

        // Pattern validation
        if (!preg_match('/tokopedia\.com\//i', $url)) {
            return response()->json([
                'success' => false,
                'message' => 'URL yang diberikan bukan URL Tokopedia yang valid'
            ], 400);
        }

        try {
            $html = Browsershot::url($url)
                ->userAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
                ->windowSize(1920, 1080)
                ->waitUntilNetworkIdle()
                ->timeout(60)
                ->bodyHtml();

            $crawler = new Crawler($html);
            $data = [
                'title' => '',
                'description' => '',
                'price' => '',
                'condition' => 'New',
                'location' => '',
                'category' => '',
                'images' => [],
                'source_url' => $url
            ];

            // Tokopedia JSON-LD is very structured
            $jsonLdScripts = $crawler->filter('script[type="application/ld+json"]');
            $jsonLdScripts->each(function (Crawler $node) use (&$data) {
                $json = json_decode($node->text(), true);
                
                // Tokopedia usually has an array of objects or a single Product object
                $items = isset($json['@type']) ? [$json] : (is_array($json) ? $json : []);

                foreach ($items as $item) {
                    if (isset($item['@type']) && $item['@type'] === 'Product') {
                        $data['title'] = $item['name'] ?? $data['title'];
                        $data['description'] = $item['description'] ?? $data['description'];
                        if (isset($item['offers']['price'])) {
                            $data['price'] = $item['offers']['price'];
                        }
                        if (isset($item['image'])) {
                            $data['images'] = is_array($item['image']) ? array_slice($item['image'], 0, 5) : [$item['image']];
                        }
                        if (isset($item['category'])) {
                            $data['category'] = $item['category'];
                        }
                    }
                }
            });

            // Fallback for location
            try {
                $data['location'] = $crawler->filter('meta[property="og:locality"]')->attr('content') ?? '';
            } catch (\Exception $e) {}

            return response()->json([
                'success' => true,
                'data' => $data
            ]);

        } catch (\Exception $e) {
            Log::error('Tokopedia Scraping Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data dari Tokopedia. Pastikan link produk benar dan publik.'
            ], 422);
        }
    }
}
