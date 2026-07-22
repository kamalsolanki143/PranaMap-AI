export interface AdvisoryPDFData {
  ward: string;
  aqi: number;
  status: string;
  ai_message: string;
  audience_tags: string[];
  updated_ago?: string;
  confidence?: number;
  recommended_actions?: string[];
}

export function generateAdvisoryPDF(data: AdvisoryPDFData): Promise<void> {
  return new Promise((resolve) => {
    const formattedWard = data.ward.replace(/\s+/g, '_');
    const filename = `Advisory_${formattedWard}_2026.pdf`;
    const dateStr = new Date().toLocaleString('en-IN', {
      dateStyle: 'full',
      timeStyle: 'medium',
    });

    const confidence = data.confidence || 94;
    const actions = data.recommended_actions || [
      'Issue immediate N95 mask mandates for vulnerable citizens',
      'Deploy water sprinklers & anti-smog guns across high-density corridors',
      'Restrict heavy diesel commercial vehicles during peak stagnation hours',
      'Enforce strict shutdown of unapproved construction & demolition sites',
    ];

    // Create print container
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      // Fallback if popups blocked
      alert('Please allow popups to export the PDF report.');
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
          @page { size: A4; margin: 18mm; }
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
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
            border-bottom: 3px solid #06b6d4;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .brand {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .logo {
            width: 42px;
            height: 42px;
            background: #06b6d4;
            color: #ffffff;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 20px;
          }
          .title-group h1 {
            margin: 0;
            font-size: 22px;
            color: #0f172a;
            letter-spacing: -0.5px;
          }
          .title-group p {
            margin: 2px 0 0 0;
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
          }
          .gov-seal {
            text-align: right;
            font-size: 11px;
            color: #475569;
            font-weight: 600;
          }
          .banner {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .ward-info h2 {
            margin: 0 0 4px 0;
            font-size: 24px;
            color: #0f172a;
          }
          .meta {
            font-size: 12px;
            color: #64748b;
          }
          .aqi-box {
            text-align: center;
            padding: 12px 24px;
            border-radius: 10px;
            background: ${data.aqi > 300 ? '#fef2f2' : data.aqi > 200 ? '#fff1f2' : '#fffbeb'};
            border: 2px solid ${data.aqi > 300 ? '#ef4444' : data.aqi > 200 ? '#be123c' : '#f59e0b'};
          }
          .aqi-num {
            font-size: 36px;
            font-weight: 800;
            color: ${data.aqi > 300 ? '#b91c1c' : data.aqi > 200 ? '#be123c' : '#b45309'};
            line-height: 1;
          }
          .aqi-label {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            margin-top: 4px;
            color: ${data.aqi > 300 ? '#991b1b' : data.aqi > 200 ? '#9f1239' : '#92400e'};
          }
          .section-title {
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #334155;
            margin-bottom: 12px;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 6px;
          }
          .advisory-card {
            background: #ecfeff;
            border-left: 4px solid #06b6d4;
            border-radius: 6px;
            padding: 16px;
            margin-bottom: 24px;
            font-size: 14px;
            color: #164e63;
          }
          .tags {
            display: flex;
            gap: 8px;
            margin-bottom: 24px;
            flex-wrap: wrap;
          }
          .tag {
            background: #e0f2fe;
            color: #0369a1;
            font-size: 11px;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 4px;
            text-transform: uppercase;
            border: 1px solid #bae6fd;
          }
          .actions-list {
            margin: 0 0 24px 0;
            padding-left: 20px;
          }
          .actions-list li {
            margin-bottom: 8px;
            font-size: 13px;
            color: #334155;
          }
          .confidence-badge {
            display: inline-block;
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            color: #475569;
            margin-bottom: 24px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 16px;
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
              <p>Government of NCT Delhi — Air Quality Division</p>
            </div>
          </div>
          <div class="gov-seal">
            <p>OFFICIAL HEALTH ADVISORY</p>
            <p>Ref ID: PRANA-2026-${Math.floor(1000 + Math.random() * 9000)}</p>
          </div>
        </div>

        <div class="banner">
          <div class="ward-info">
            <h2>${data.ward}</h2>
            <div class="meta">
              <p>Generated: <strong>${dateStr}</strong></p>
              <p>Jurisdiction: Delhi NCR Air Quality Monitoring Grid</p>
            </div>
          </div>
          <div class="aqi-box">
            <div class="aqi-num">${data.aqi}</div>
            <div class="aqi-label">${data.status}</div>
          </div>
        </div>

        <div class="section-title">Official AI Health Advisory Message</div>
        <div class="advisory-card">
          ${data.ai_message}
        </div>

        <div class="section-title">Target Vulnerable Groups</div>
        <div class="tags">
          ${data.audience_tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>

        <div class="section-title">AI Decision Confidence</div>
        <div class="confidence-badge">
          Model Confidence: <strong>${confidence}%</strong> (Multi-sensor Corroborated)
        </div>

        <div class="section-title">Mandatory Public Precautions & Enforcement Actions</div>
        <ul class="actions-list">
          ${actions.map(act => `<li>${act}</li>`).join('')}
        </ul>

        <div class="footer">
          <span>PranaMap AI Urban Defense Platform • Confidential Government Record</span>
          <span>Document: ${filename}</span>
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

    // Trigger toast resolution after delay
    setTimeout(() => {
      resolve();
    }, 500);
  });
}
