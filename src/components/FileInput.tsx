import React from 'react';
import * as XLSX from 'xlsx';
import FileSaver from 'file-saver';

interface FileInputProps {
  onDataUpdate: (data: any[]) => void;
}

const FileInput: React.FC<FileInputProps> = ({ onDataUpdate }) => {
  const [data, setData] = React.useState<any[] | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      const workbook = XLSX.read(event.target?.result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const sheetData = XLSX.utils.sheet_to_json(sheet, { raw: true });

      const parsedData = sheetData.map((record: any) => ({
        ...record,
        date: typeof record.date === 'number' ? convertExcelSerialDate(record.date) : record.date,
        distance_diff: record.distance_stop - record.distance_start
      }));

      onDataUpdate(parsedData);
      setData(parsedData);
      console.log(parsedData);
    };

    reader.readAsBinaryString(file);
  };

  const convertExcelSerialDate = (serial: number): string | null => {
    if (typeof serial === 'number') {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const daysOffset = serial - 1;
      const resultDate = new Date(excelEpoch.getTime() + daysOffset * 24 * 60 * 60 * 1000);
      resultDate.setDate(resultDate.getDate() + 1);
      return resultDate.toISOString().split('T')[0];
    }
    return null;
  };

  const handleChange = (index: number, field: string, value: any | number | string) => {
    if (data) {
      const updatedData = data.map((row, idx) =>
          idx === index
            ? {
                ...row,
                [field]: value,
                distance_diff: field === 'distance_stop'
                  ? value - row.distance_start
                  : field === 'distance_start'
                  ? row.distance_stop - value
                  : row.distance_diff
              }
            : row
      );
      onDataUpdate(updatedData);
      setData(updatedData);
      console.log(updatedData);
    }
  };

  const insertRow = () => {
    const formattedDate = getToday();

    const newRow = {
      date: formattedDate,
      distance_start: 0,
      distance_stop: 0,
      distance_diff: 0
    };

    setData([...(data || []), newRow]);
  };

  const exportToCSV = () => {
    if (!data || data.length === 0) {
      console.error('No data to export');
      return;
    }
    const formattedDate = getToday();
    const fileName = `logbook_${formattedDate}.xlsx`;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    FileSaver.saveAs(dataBlob, fileName);
  }

  const createLogbook = () => {
    const formattedDate = getToday();

    const newRow = {
      date: formattedDate,
      distance_start: 0,
      distance_stop: 0,
      distance_diff: 0
    };

    setData(prevData => (prevData ? [...prevData, newRow] : [newRow]));
  }

  const getToday = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return (
    <div>
      <div className='row d-flex align-items-center'>
        <div className='col-md-8'>
          <div className="input-group">
            <input type="file" className='form-control btn btn-dark' onChange={handleFileUpload} />
          </div>
        </div>
        <div className='col-md-1'>OR</div>
        <div className='col-md-3'><button className='btn btn-dark' onClick={createLogbook}>Create a logbook</button></div>
      </div>

      {data && (<>
        <table className='table table-striped mt-4'>
          <thead className="table-secondary">
            <tr>
              <th scope="col" className='text-center'>Date</th>
              <th scope="col" className='text-end'>Distance start (KM)</th>
              <th scope="col" className='text-end'>Distance stop (KM)</th>
              <th scope="col" className='text-end'>Travel distance (KM)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td className='text-center'>
                  <input type="date" className='form-control'
                    value={item.date} 
                    onChange={(e) => {
                      const selectedDate = new Date(e.target.value).toISOString().split('T')[0];
                      handleChange(index, 'date', selectedDate);
                    }} />
                </td>
                <td className='text-end'>
                  <input
                    type='number' className='form-control'
                    value={item.distance_start}
                    onChange={(e) => handleChange(index, 'distance_start', Number(e.target.value))}
                  />
                </td>
                <td className='text-end'>
                  <input
                    type='number' className='form-control'
                    value={item.distance_stop}
                    onChange={(e) => handleChange(index, 'distance_stop', Number(e.target.value))}
                  />
                </td>
                <td className='text-end'>{item.distance_diff}</td>
              </tr>
            ))}
            <tr>
              <td className='text-center' colSpan={4}>
                <button className="btn btn-link" onClick={insertRow}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-circle" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div className='d-flex justify-content-around'>
          <button className='btn btn-dark mb-3' onClick={exportToCSV}>Export</button>
          <button className='btn btn-dark mb-3' onClick={()=>window.location.reload()}>Reload</button>
        </div>
      </>)}
    </div>
  );
};

export default FileInput;