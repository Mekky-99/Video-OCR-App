export const downloadCSV = (data) => {
    if (!data || data.length === 0) return;

    const headers = ['Timestamp', 'VideoTime', 'Confidence', 'Text'];
    const rows = data.map(item => [
        item.timestamp,
        item.videoTimestamp,
        Math.round(item.confidence) + '%',
        `"${item.text.replace(/"/g, '""')}"` // Escape quotes
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    // Add Byte Order Mark (BOM) for Excel UTF-8 support
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ocr-export-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const downloadJSON = (data) => {
    if (!data || data.length === 0) return;

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ocr-export-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
