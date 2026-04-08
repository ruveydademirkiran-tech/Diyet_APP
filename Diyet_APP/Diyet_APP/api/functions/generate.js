const fetch = require('node-fetch');

// Vercel için standart fonksiyon yapısı
export default async function handler(req, res) {
  
  // 1. Tarayıcı İzinleri (CORS) - Mutlaka olmalı
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Ön kontrol (preflight) isteğini onayla
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Sadece POST isteklerini kabul et
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST isteği gönderilebilir.' });
  }

  try {
    // 2. HTML'den gelen verileri al
    const { goal, level, days, equip, notes } = req.body;
    
    // 3. API Anahtarını Vercel Panelinden (Environment Variables) çekeceğiz
    const apiKey = process.env.ANTHROPIC_API_KEY; 

    // 4. Claude'a gidecek talimat (Prompt)
    const prompt = `Sen uzman bir antrenör ve diyetisyensin. Aşağıdaki bilgilere göre Türkçe, profesyonel bir antrenman programı yaz:
    Hedef: ${goal}, Seviye: ${level}, Haftalık Gün: ${days}, Ekipman: ${equip}, Ek Notlar: ${notes}.`;

    // 5. Anthropic API İsteği
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    // 6. Hata kontrolü ve Yanıt gönderme
    if (!response.ok) {
      console.error("Claude API Hatası:", data);
      return res.status(response.status).json(data);
    }

    // Claude'dan gelen metni index.html'e gönder
    return res.status(200).json({ text: data.content[0].text });

  } catch (error) {
    console.error("Sistem Hatası:", error.message);
    return res.status(500).json({ error: error.message });
  }
}