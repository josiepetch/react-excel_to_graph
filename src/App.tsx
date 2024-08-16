import React from 'react'
import './App.css'
import FileInput from './components/FileInput'
import GenerateChart from './components/GenerateChart'

function App() {

  const [chartData, setChartData] = React.useState<any[] | null>(null);

  const handleDataUpdate = (data: any[]) => {
    setChartData(data);
  };

  return (
    <>
      <h1 className='mb-4'>Logbook</h1>

      <FileInput onDataUpdate={handleDataUpdate} />

      {chartData && <GenerateChart data={chartData} />}
    </>
  )
}

export default App
