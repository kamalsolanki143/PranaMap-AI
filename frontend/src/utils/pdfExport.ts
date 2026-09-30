export interface AdvisoryPDFData {
  city?: string;
  ward: string;
  aqi: number;
  status: string;
  ai_message: string;
  audience_tags: string[];
  updated_ago?: string;
  reliability?: string;
  recommended_actions?: string[];
  primary_driver?: string;
}

export function generateAdvisoryPDF(data: AdvisoryPDFData): Promise<void> {
  return new Promise((resolve) => {
    const formattedWard = data.ward.replace(/\s+/g, '_');
    const filename = `PranaMap_Advisory_${formattedWard}_2026.pdf`;
    const dateStr = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'medium',
    });

    const cityName = data.city || 'Delhi NCR';
    const reliability = data.reliability || 'High (Multi-sensor CPCB & Sentinel-5P corroborated)';
    const actions = data.recommended_actions || [
      'Issue immediate N95 mask guidance for sensitive groups and children',
      'Deploy mechanical water mist suppression across congested corridors',
      'Reroute non-essential commercial transit outside peak stagnation window',
      'Suspend open excavation & fugitive dust generation on active civil construction sites',
    ];

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to export the official advisory PDF.');
      resolve();
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>${filename}</title>
        <style>
          @page { size: A4; margin: 16mm; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            margin: 0;
            padding: 24px;
            line-height: 1.5;
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #0d9488;
            padding-bottom: 14px;
            margin-bottom: 20px;
          }
          .brand {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .logo {
            width: 38px;
            height: 38px;
            background: #0d9488;
            color: #ffffff;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 18px;
          }
          .title-group h1 {
            margin: 0;
            font-size: 20px;
            color: #0f172a;
            letter-spacing: -0.3px;
          }
          .title-group p {
            margin: 2px 0 0 0;
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            font-weight: 600;
          }
          .gov-seal {
            text-align: right;
            font-size: 11px;
            color: #475569;
          }
          .banner {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px 20px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .ward-info h2 {
            margin: 0 0 4px 0;
            font-size: 20px;
            color: #0f172a;
          }
          .meta {
            font-size: 11px;
            color: #64748b;
          }
          .aqi-box {
            text-align: center;
            padding: 10px 20px;
            border-radius: 8px;
            background: ${data.aqi > 300 ? '#fef2f2' : data.aqi > 200 ? '#fff1f2' : '#fffbeb'};
            border: 1px solid ${data.aqi > 300 ? '#ef4444' : data.aqi > 200 ? '#be123c' : '#f59e0b'};
          }
          .aqi-num {
            font-size: 32px;
            font-weight: 800;
            color: ${data.aqi > 300 ? '#b91c1c' : data.aqi > 200 ? '#be123c' : '#b45309'};
            line-height: 1;
          }
          .aqi-label {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            margin-top: 4px;
            color: ${data.aqi > 300 ? '#991b1b' : data.aqi > 200 ? '#9f1239' : '#92400e'};
          }
          .section-title {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            color: #334155;
            margin-bottom: 8px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 4px;
          }
          .advisory-card {
            background: #f0fdfa;
            border-left: 4px solid #0d9488;
            border-radius: 4px;
            padding: 14px;
            margin-bottom: 20px;
            font-size: 13px;
            color: #134e4a;
            line-height: 1.6;
          }
          .tags {
            display: flex;
            gap: 6px;
            margin-bottom: 20px;
            flex-wrap: wrap;
          }
          .tag {
            background: #e2e8f0;
            color: #334155;
            font-size: 10px;
            font-weight: 600;
            padding: 3px 8px;
            border-radius: 4px;
            text-transform: uppercase;
          }
          .actions-list {
            margin: 0 0 20px 0;
            padding-left: 18px;
          }
          .actions-list li {
            margin-bottom: 6px;
            font-size: 12px;
            color: #334155;
          }
          .meta-pill {
            display: inline-block;
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 11px;
            color: #475569;
            margin-bottom: 20px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 12px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">
            <div class="logo">P</div>
            <div class="title-group">
              <h1>PranaMap AI</h1>
              <p>Municipal Environmental Intelligence & Decision Support</p>
            </div>
          </div>
          <div class="gov-seal">
            <p><strong>OFFICIAL CITIZEN HEALTH ADVISORY</strong></p>
            <p>Jurisdiction: ${cityName}</p>
          </div>
        </div>

        <div class="banner">
          <div class="ward-info">
            <h2>${data.ward}</h2>
            <div class="meta">
              <p>Generated: <strong>${dateStr}</strong></p>
              <p>Primary Driver: <strong>${data.primary_driver || 'Traffic emissions & low atmospheric dispersion'}</strong></p>
            </div>
          </div>
          <div class="aqi-box">
            <div class="aqi-num">${data.aqi}</div>
            <div class="aqi-label">${data.status}</div>
          </div>
        </div>

        <div class="section-title">Official Health Advisory</div>
        <div class="advisory-card">
          ${data.ai_message}
        </div>

        <div class="section-title">Vulnerable Target Groups</div>
        <div class="tags">
          ${data.audience_tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>

        <div class="section-title">Model Evidence & Reliability</div>
        <div class="meta-pill">
          ${reliability}
        </div>

        <div class="section-title">Recommended Precautionary Interventions</div>
        <ul class="actions-list">
          ${actions.map(act => `<li>${act}</li>`).join('')}
        </ul>

        <div class="footer">
          <span>PranaMap AI • Clean Air & Climate Resilience Platform</span>
          <span>Verified Environmental Intelligence Record</span>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    setTimeout(() => {
      resolve();
    }, 500);
  });
}
