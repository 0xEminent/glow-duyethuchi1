// Netlify Function: proxy frontend -> Google Apps Script Web App.
// Set the Netlify environment variable:
// GAS_WEB_APP_URL = https://script.google.com/macros/s/XXXXXXXX/exec

exports.handler = async (event) => {
  const gasUrl = process.env.GAS_WEB_APP_URL;

  if (typeof fetch !== 'function') {
    return json(500, {
      ok: false,
      message: 'Runtime Netlify Functions không có fetch() toàn cục (Node < 18). Kiểm tra NODE_VERSION trong netlify.toml rồi redeploy.'
    });
  }

  if (!gasUrl) {
    return json(500, {
      ok: false,
      message: 'Chưa cấu hình GAS_WEB_APP_URL trên Netlify.'
    });
  }

  try {
    const isGet = event.httpMethod === 'GET';

    let targetUrl = gasUrl;
    if (isGet) {
      const action = event.queryStringParameters?.action || 'dropdown';
      targetUrl += (gasUrl.includes('?') ? '&' : '?') + 'action=' + encodeURIComponent(action);
    }

    const options = {
      method: event.httpMethod,
      redirect: 'follow',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (!isGet) {
      options.body = event.body || '{}';
    }

    const response = await fetch(targetUrl, options);
    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (_) {
      // Apps Script không trả JSON => gần như chắc chắn là 1 trong 3 lý do:
      // (1) Web app đang chạy deployment CŨ (chưa "New deployment" sau khi sửa code)
      // (2) Deployment chưa đặt "Who has access: Anyone" -> bị Google redirect sang trang đăng nhập
      // (3) targetUrl sai / thiếu ?action=
      const looksLikeLogin = /accounts\.google\.com|ServiceLogin/i.test(text);
      const looksLikeHtml = /<html/i.test(text);

      let hint = 'Apps Script không trả về JSON hợp lệ.';
      if (looksLikeLogin) {
        hint += ' Có vẻ Google đang yêu cầu đăng nhập -> kiểm tra deployment "Who has access" phải là "Anyone".';
      } else if (looksLikeHtml) {
        hint += ' Có vẻ Apps Script đang trả về trang HTML (deployment CŨ chưa có routing ?action=) -> vào Apps Script > Deploy > Manage deployments, tạo "New deployment" (hoặc bump version) sau khi cập nhật code, rồi cập nhật lại GAS_WEB_APP_URL nếu URL đổi.';
      }

      data = {
        ok: false,
        message: hint,
        upstream_status: response.status,
        target_url: targetUrl,
        raw: text.slice(0, 500)
      };
    }

    return json(response.status, data);

  } catch (error) {
    return json(502, {
      ok: false,
      message: 'Không kết nối được Apps Script: ' + (error.message || String(error))
    });
  }
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify(body)
  };
}
