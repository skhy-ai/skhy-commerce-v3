import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileText, Download, User, Building, MapPin } from 'lucide-react';

export const QuoteGenerator = () => {
  const [buyerName, setBuyerName] = useState('');
  const [buyerCompany, setBuyerCompany] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0]);

  // Default data from user prompt
  const [items, setItems] = useState([
    { description: 'Sample Unit', qty: 1, unitPrice: 840, total: 840 },
    { description: 'Bulk Order (200 pcs) - Available', qty: 200, unitPrice: 770, total: 154000 },
    { description: 'Bulk Order (500 pcs)', qty: 500, unitPrice: 699, total: 349500 },
  ]);

  const [shippingCost, setShippingCost] = useState(115);
  const [shippingMethod, setShippingMethod] = useState('UPS (for sample)');

  const [hsCode, setHsCode] = useState('8529');
  const [hsDescription, setHsDescription] = useState('Parts suitable for use solely or principally with radio-navigational apparatus');
  const [bcd, setBcd] = useState('10%');
  const [sws, setSws] = useState('10% (on BCD)');
  const [igst, setIgst] = useState('18%');
  const [totalDuty, setTotalDuty] = useState('~29.8%');

  const generatePDF = async () => {
    const doc = new jsPDF('p', 'pt', 'a4');

    // Header & Logo
    // Try to add the logo if available, otherwise just text
    try {
      const logoUrl = '/skhy-logo.jpg';
      const img = new Image();
      img.src = logoUrl;
      // We need to wait for the image to load
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve; // Continue even if error
      });
      if (img.width > 0) {
        doc.addImage(img, 'JPEG', 40, 40, 60, 60);
      } else {
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('Skhy AI', 40, 70);
      }
    } catch (e) {
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('Skhy AI', 40, 70);
    }

    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(41, 128, 185);
    doc.text('QUOTE', 400, 70);

    // Company Info
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.text('Skhy AI', 400, 90);
    doc.text('Email: nikki@skhy.systems', 400, 105);
    doc.text('Phone: +60102218428', 400, 120);

    // Date & Quote Info
    doc.text(`Date: ${quoteDate}`, 400, 145);
    
    // Bill To
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 40, 140);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(buyerCompany || '[Buyer Company]', 40, 155);
    doc.text(buyerName || '[Buyer Name]', 40, 170);
    doc.text(buyerAddress || '[Buyer Address]', 40, 185);

    // Table
    const tableColumn = ["Description", "Quantity", "Unit Price (USD)", "Total (USD)"];
    const tableRows: string[][] = [];

    items.forEach(item => {
      const itemData = [
        item.description,
        item.qty.toString(),
        `$${item.unitPrice.toFixed(2)}`,
        `$${item.total.toFixed(2)}`
      ];
      tableRows.push(itemData);
    });

    autoTable(doc, {
      startY: 220,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 }
    });

    let finalY = (doc as any).lastAutoTable.finalY || 220;

    // Shipping & Conditions
    finalY += 30;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Shipping & Conditions', 40, finalY);
    
    finalY += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Shipping Method: ${shippingMethod}`, 40, finalY);
    finalY += 15;
    doc.text(`Shipping Cost: $${shippingCost.toFixed(2)}`, 40, finalY);

    // HS Code & Duty Details
    finalY += 30;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Customs & Duty Information', 40, finalY);
    
    finalY += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`HS Code: ${hsCode}`, 40, finalY);
    finalY += 15;
    
    // Split description into multiple lines if too long
    const splitDesc = doc.splitTextToSize(`Description: ${hsDescription}`, 500);
    doc.text(splitDesc, 40, finalY);
    finalY += (splitDesc.length * 15);
    
    doc.text(`Basic Customs Duty (BCD): ${bcd}`, 40, finalY);
    finalY += 15;
    doc.text(`Social Welfare Surcharge (SWS): ${sws}`, 40, finalY);
    finalY += 15;
    doc.text(`Integrated Goods & Services Tax (IGST): ${igst}`, 40, finalY);
    finalY += 15;
    doc.text(`Total Estimated Duty: ${totalDuty}`, 40, finalY);

    // Sign off
    finalY += 50;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Nikki C', 40, finalY);
    doc.setFont('helvetica', 'normal');
    finalY += 15;
    doc.text('Chief Executive Officer', 40, finalY);
    finalY += 15;
    doc.text('Skhy AI', 40, finalY);

    doc.save(`Quote_${buyerCompany || 'SkhyAI'}_${quoteDate}.pdf`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto text-white">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-turquoise-400" />
          Custom Quote Generator
        </h1>
        <button
          onClick={generatePDF}
          className="flex items-center gap-2 px-4 py-2 bg-turquoise-500 hover:bg-turquoise-400 text-navy-950 font-bold rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Generate PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Client Details Section */}
        <div className="bg-navy-900 rounded-xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold mb-4 border-b border-white/10 pb-2">Client Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Company Name</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={buyerCompany}
                  onChange={(e) => setBuyerCompany(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-navy-950 border border-white/10 rounded-lg focus:outline-none focus:border-turquoise-400 text-white"
                  placeholder="Acme Corp"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Contact Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-navy-950 border border-white/10 rounded-lg focus:outline-none focus:border-turquoise-400 text-white"
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <textarea
                  value={buyerAddress}
                  onChange={(e) => setBuyerAddress(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-navy-950 border border-white/10 rounded-lg focus:outline-none focus:border-turquoise-400 text-white min-h-[80px]"
                  placeholder="123 Business St, City, Country"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Quote Date</label>
              <input
                type="date"
                value={quoteDate}
                onChange={(e) => setQuoteDate(e.target.value)}
                className="w-full px-4 py-2 bg-navy-950 border border-white/10 rounded-lg focus:outline-none focus:border-turquoise-400 text-white"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Customs Section */}
        <div className="bg-navy-900 rounded-xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold mb-4 border-b border-white/10 pb-2">Shipping & Customs Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Shipping Cost (USD)</label>
                <input
                  type="number"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-navy-950 border border-white/10 rounded-lg focus:outline-none focus:border-turquoise-400 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Shipping Method</label>
                <input
                  type="text"
                  value={shippingMethod}
                  onChange={(e) => setShippingMethod(e.target.value)}
                  className="w-full px-4 py-2 bg-navy-950 border border-white/10 rounded-lg focus:outline-none focus:border-turquoise-400 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">HS Code</label>
                <input
                  type="text"
                  value={hsCode}
                  onChange={(e) => setHsCode(e.target.value)}
                  className="w-full px-4 py-2 bg-navy-950 border border-white/10 rounded-lg focus:outline-none focus:border-turquoise-400 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Total Estimated Duty</label>
                <input
                  type="text"
                  value={totalDuty}
                  onChange={(e) => setTotalDuty(e.target.value)}
                  className="w-full px-4 py-2 bg-navy-950 border border-white/10 rounded-lg focus:outline-none focus:border-turquoise-400 text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">HS Description</label>
              <textarea
                value={hsDescription}
                onChange={(e) => setHsDescription(e.target.value)}
                className="w-full px-4 py-2 bg-navy-950 border border-white/10 rounded-lg focus:outline-none focus:border-turquoise-400 text-white min-h-[60px]"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">BCD</label>
                <input
                  type="text"
                  value={bcd}
                  onChange={(e) => setBcd(e.target.value)}
                  className="w-full px-2 py-1 bg-navy-950 border border-white/10 rounded-lg focus:outline-none focus:border-turquoise-400 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">SWS</label>
                <input
                  type="text"
                  value={sws}
                  onChange={(e) => setSws(e.target.value)}
                  className="w-full px-2 py-1 bg-navy-950 border border-white/10 rounded-lg focus:outline-none focus:border-turquoise-400 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">IGST</label>
                <input
                  type="text"
                  value={igst}
                  onChange={(e) => setIgst(e.target.value)}
                  className="w-full px-2 py-1 bg-navy-950 border border-white/10 rounded-lg focus:outline-none focus:border-turquoise-400 text-white text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="bg-navy-900 rounded-xl p-6 border border-white/10 mt-8">
        <h2 className="text-lg font-semibold mb-4 border-b border-white/10 pb-2">Line Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 border-b border-white/10">
                <th className="pb-2 font-medium">Description</th>
                <th className="pb-2 font-medium">Quantity</th>
                <th className="pb-2 font-medium">Unit Price (USD)</th>
                <th className="pb-2 font-medium text-right">Total (USD)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b border-white/5">
                  <td className="py-3 pr-4">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].description = e.target.value;
                        setItems(newItems);
                      }}
                      className="w-full px-3 py-1.5 bg-navy-950 border border-white/10 rounded-lg focus:outline-none focus:border-turquoise-400 text-white text-sm"
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].qty = Number(e.target.value);
                        newItems[index].total = newItems[index].qty * newItems[index].unitPrice;
                        setItems(newItems);
                      }}
                      className="w-24 px-3 py-1.5 bg-navy-950 border border-white/10 rounded-lg focus:outline-none focus:border-turquoise-400 text-white text-sm"
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].unitPrice = Number(e.target.value);
                        newItems[index].total = newItems[index].qty * newItems[index].unitPrice;
                        setItems(newItems);
                      }}
                      className="w-32 px-3 py-1.5 bg-navy-950 border border-white/10 rounded-lg focus:outline-none focus:border-turquoise-400 text-white text-sm"
                    />
                  </td>
                  <td className="py-3 text-right">
                    ${item.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
