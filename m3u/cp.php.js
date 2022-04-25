
addEventListener('fetch', function (event) {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.url.endsWith('/m3u/cp.php')) {
    if (request.method !== 'POST') return BadRequest(405);
    // Запрос: Проверка типа
    const q_ct = request.headers.get('content-type') || '';
    if (!q_ct.includes('form')) return BadRequest();
    // Запрос: Проверка размера ( 12 < cl < 512)
    const c_fl = parseInt(request.headers.get("content-length"), 10);
    if (isNaN(c_fl) || c_fl <= 12 || c_fl > 512) return BadRequest(413);
    // Запрос: Проверка данных
    const c_fd = await request.formData();
    const url = c_fd.get('url')
    if (!/^@https?:\/\//.test(url)) return BadRequest();
    
    // Ответ: Проверка размера ( 0 < cl < 768 Кб)
    let response = await fetch(url.substring(1), {method: 'HEAD'});
    let r_cl = parseInt(response.headers.get("content-length"), 10) || 1;
    if (r_cl == 0 || r_cl > 786432) return BadRequest(413);
    // Ответ: Проверка типа
    const r_ct = response.headers.get("content-type") || 'text';
    if (!/text|json|mpegurl|octet-stream/.test(r_ct)) return BadRequest(415);

    // Загрузка
    response = await fetch(url.substring(1));
    response = new Response(response.body, response);
    // Добавление CORS заголовков
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response
  }
  return BadRequest();
}

function BadRequest(p_code=400) {
    return new Response(`Error ${p_code}`, { status: p_code });
}