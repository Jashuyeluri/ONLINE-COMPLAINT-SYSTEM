import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateComplaintsPDF = (complaints, userName) => {
  try {
    const doc = new jsPDF();

    // Header branding
    doc.setFontSize(11);
    doc.setTextColor(79, 70, 229);
    doc.text('RESOLVE CITY PORTAL', 14, 16);

    // Divider line
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.5);
    doc.line(14, 19, 196, 19);

    // Report title
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42);
    doc.text('My Personal Complaint Report', 14, 30);

    // Citizen info
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Citizen: ${userName}`, 14, 39);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, 14, 45);
    doc.text(`This report contains only your personally submitted complaints.`, 14, 51);

    // Stats summary
    const stats = {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'Pending').length,
      inProgress: complaints.filter(c => c.status === 'In Progress').length,
      resolved: complaints.filter(c => c.status === 'Resolved').length,
    };

    autoTable(doc, {
      startY: 58,
      head: [['My Total Complaints', 'Pending', 'In Progress', 'Resolved']],
      body: [[stats.total, stats.pending, stats.inProgress, stats.resolved]],
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
      bodyStyles: { fontStyle: 'bold', fontSize: 11 }
    });

    // Complaints detail table
    const tableData = complaints.map(c => [
      c.title,
      c.category,
      c.status,
      c.location,
      new Date(c.createdAt).toLocaleDateString()
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 12,
      head: [['Title', 'Category', 'Status', 'Location', 'Date Submitted']],
      body: tableData,
      headStyles: { fillColor: [79, 70, 229] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 2) {
          if (data.cell.raw === 'Resolved') data.cell.styles.textColor = [16, 185, 129];
          else if (data.cell.raw === 'In Progress') data.cell.styles.textColor = [59, 130, 246];
          else data.cell.styles.textColor = [245, 158, 11];
        }
      }
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text(`Resolve City Portal — Personal Copy for ${userName} — Not for official distribution`, 14, doc.internal.pageSize.height - 10);

    doc.save(`My_Complaints_${userName.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (err) {
    console.error('PDF Generation Error:', err);
    throw err;
  }
};

export const exportToDetailedPDF = (complaints) => {
  try {
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape for more space
    
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42);
    doc.text('City-Wide Infrastructure Audit Log', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Total Records: ${complaints.length}`, 14, 28);
    doc.text(`Export Date: ${new Date().toLocaleString()}`, 14, 33);

    const tableData = complaints.map(c => [
      c.title,
      c.description?.substring(0, 50) + (c.description?.length > 50 ? '...' : ''),
      c.category,
      c.status,
      c.location,
      c.createdBy?.name || 'N/A',
      new Date(c.createdAt).toLocaleDateString()
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Title', 'Description', 'Category', 'Status', 'Location', 'Citizen', 'Date']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [15, 23, 42] },
      columnStyles: {
        1: { cellWidth: 60 }, // Description column width
      }
    });

    doc.save(`Admin_Complaints_Export_${new Date().getTime()}.pdf`);
  } catch (err) {
    console.error('Detailed PDF Error:', err);
    throw err;
  }
};

export const exportToCSV = (complaints) => {
  try {
    if (!complaints || complaints.length === 0) {
      throw new Error('No data available to export');
    }

    const headers = ['Title', 'Description', 'Category', 'Status', 'Location', 'Citizens Name', 'Citizens Email', 'Date'];
    const csvData = complaints.map(c => [
      `"${c.title?.replace(/"/g, '""') || ''}"`,
      `"${c.description?.replace(/"/g, '""') || ''}"`,
      c.category || '',
      c.status || '',
      `"${c.location?.replace(/"/g, '""') || ''}"`,
      `"${c.createdBy?.name || 'Unknown'}"`,
      `"${c.createdBy?.email || 'Unknown'}"`,
      new Date(c.createdAt).toLocaleDateString()
    ]);

    const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `Complaints_Data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('CSV Export Error:', err);
    throw err;
  }
};
