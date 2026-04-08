const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Tarayıcı izinleri (CORS) - Hata almanı önler
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Tarayıcı bazen ön kontrol (preflight) yapar, onu onaylıyoruz
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { goal, level, days, equip, notes } = JSON.parse(event.body);
    
    //
    const apiKey = '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'; 

    const prompt = `Sen deneyimli bir antrenörsün. Şu bilgilere göre Türkçe antrenman programı yaz: 
    Hedef: ${goal}, Seviye: ${level}, Gün: ${days}, Ekipman: ${equip}, Notlar: ${notes}. 
    Lütfen her gün için başlık, egzersiz adı ve set x tekrar yaz.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // En hızlı ve stabil çalışan model
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    // API'den hata gelirse yakala
    if (!response.ok) {
      return { 
        statusCode: response.status, 
        headers, 
        body: JSON.stringify(data) 
      };
    }

    // Başarılı sonucu gönder
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    return { 
      statusCode: 500, 
      headers, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};