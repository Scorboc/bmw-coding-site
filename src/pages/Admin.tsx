import AdminLogin from '@/components/admin/AdminLogin';
import { DATA_API_URL, adminFetch, hasAdminSession } from '@/lib/api';
import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import AddCarForm, { type ChiptuningRecord } from '@/components/admin/AddCarForm';
import AdminFilters from '@/components/admin/AdminFilters';
import AdminTable from '@/components/admin/AdminTable';

const API_URL = DATA_API_URL;

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(hasAdminSession);
  const [records, setRecords] = useState<ChiptuningRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeries, setFilterSeries] = useState('all');
  const [filterBodyType, setFilterBodyType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');


  useEffect(() => {
    if (authenticated) loadData();
  }, [authenticated]);

  const loadData = async () => {
    try {
      const response = await adminFetch(`${API_URL}?admin=1`);
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      if (!hasAdminSession()) setAuthenticated(false);
      console.error('Ошибка загрузки:', error);
      alert('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(r => {
    const matchSearch = searchTerm === '' || 
      r.model_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.engine_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSeries = filterSeries === 'all' || r.series === filterSeries;
    const matchBodyType = filterBodyType === 'all' || r.body_type === filterBodyType;
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    
    return matchSearch && matchSeries && matchBodyType && matchStatus;
  });

  const uniqueSeries = Array.from(new Set(records.map(r => r.series))).sort();
  const uniqueBodyTypes = Array.from(new Set(records.map(r => r.body_type))).sort();

  const saveRecord = async (updatedRecord: ChiptuningRecord) => {
    try {
      const response = await adminFetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          id: updatedRecord.id,
          data: {
            model_name: updatedRecord.model_name,
            series: updatedRecord.series,
            body_type: updatedRecord.body_type,
            engine_code: updatedRecord.engine_code,
            article_code: updatedRecord.article_code,
            stock_power: updatedRecord.stock.power,
            stock_torque: updatedRecord.stock.torque,
            stage1_power: updatedRecord.stage1.power,
            stage1_torque: updatedRecord.stage1.torque,
            stage1_price: updatedRecord.stage1.price,
            stage2_power: updatedRecord.stage2?.power ?? null,
            stage2_torque: updatedRecord.stage2?.torque ?? null,
            stage2_price: updatedRecord.stage2?.price ?? null,
            stage_type: updatedRecord.stage_type,
            is_restyling: updatedRecord.is_restyling,
            status: updatedRecord.status,
            show_stage2: updatedRecord.show_stage2,
            firmware_type: updatedRecord.firmware_type
          }
        })
      });

      if (response.ok) {
        setRecords(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
        return true;
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Ошибка сохранения');
    }
    return false;
  };

  const addNewRecord = async (newData: Omit<ChiptuningRecord, 'id'>) => {
    try {
      const response = await adminFetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          data: {
            model_name: newData.model_name,
            series: newData.series,
            body_type: newData.body_type,
            engine_code: newData.engine_code,
            article_code: newData.article_code,
            stock_power: newData.stock.power,
            stock_torque: newData.stock.torque,
            stage1_power: newData.stage1.power,
            stage1_torque: newData.stage1.torque,
            stage1_price: newData.stage1.price,
            stage2_power: newData.stage2?.power ?? null,
            stage2_torque: newData.stage2?.torque ?? null,
            stage2_price: newData.stage2?.price ?? null,
            stage_type: newData.stage_type,
            is_restyling: newData.is_restyling,
            status: newData.status,
            show_stage2: newData.show_stage2,
            firmware_type: newData.firmware_type
          }
        })
      });

      if (response.ok) {
        alert('✅ Автомобиль успешно добавлен!');
        loadData();
        setShowAddForm(false);
        return true;
      }
    } catch (error) {
      console.error('Ошибка добавления:', error);
      alert('Ошибка добавления записи');
    }
    return false;
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await adminFetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_csv' })
      });
      
      const result = await response.json();
      if (result.message?.includes('Successfully')) {
        alert('✅ Данные успешно синхронизированы с GitHub!');
      } else {
        alert(`⚠️ ${result.message || 'Ошибка синхронизации'}`);
      }
    } catch (error) {
      console.error('Ошибка синхронизации:', error);
      alert('❌ Ошибка синхронизации');
    } finally {
      setSyncing(false);
    }
  };

  const handleExport = () => {
    const headers = ['Модель', 'Серия', 'Кузов', 'Двигатель', 'Артикул', 'Сток л.с.', 'Сток Нм', 'Stage1 л.с.', 'Stage1 Нм', 'Цена Stage1', 'Stage2 л.с.', 'Stage2 Нм', 'Цена Stage2', 'Тип', 'Рестайлинг', 'Статус', 'Показ Stage2'];
    const rows = records.map(r => [
      r.model_name, r.series, r.body_type, r.engine_code, r.article_code,
      r.stock.power, r.stock.torque, r.stage1.power, r.stage1.torque, r.stage1.price,
      r.stage2?.power ?? '', r.stage2?.torque ?? '', r.stage2?.price ?? '', r.stage_type, r.is_restyling ? '1' : '0', r.status, r.show_stage2 ? '1' : '0'
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chiptuning_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').slice(1);
      
      for (const line of lines) {
        const parts = line.split(',');
        if (parts.length < 16) continue;

        try {
          await adminFetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'add',
              data: {
                model_name: parts[0],
                series: parts[1],
                body_type: parts[2],
                engine_code: parts[3],
                article_code: parts[4],
                stock_power: parseFloat(parts[5]),
                stock_torque: parseFloat(parts[6]),
                stage1_power: parseFloat(parts[7]),
                stage1_torque: parseFloat(parts[8]),
                stage1_price: parseFloat(parts[9]),
                stage2_power: parts[10] ? parseFloat(parts[10]) : null,
                stage2_torque: parts[11] ? parseFloat(parts[11]) : null,
                stage2_price: parts[12] ? parseFloat(parts[12]) : null,
                stage_type: parts[13],
                is_restyling: parts[14] === '1',
                status: parts[15],
                show_stage2: parts[16] === '1'
              }
            })
          });
        } catch (error) {
          console.error('Ошибка импорта строки:', error);
        }
      }
      
      loadData();
      alert('Импорт завершён');
    };
    reader.readAsText(file);
  };

  const handleDelete = async (id: number) => {
    await adminFetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id })
    });
    loadData();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterSeries('all');
    setFilterBodyType('all');
    setFilterStatus('all');
  };

  if (!authenticated) return <AdminLogin onSuccess={() => setAuthenticated(true)} />;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Админ-панель чип-тюнинга</h1>
          <div className="flex gap-3">
            <Button 
              onClick={() => window.location.href = '/analytics'}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Icon name="BarChart3" className="w-5 h-5 mr-2" />
              Статистика
            </Button>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Icon name={showAddForm ? 'X' : 'Plus'} className="w-5 h-5 mr-2" />
              {showAddForm ? 'Отменить' : 'Добавить автомобиль'}
            </Button>
            <Button 
              onClick={handleSync}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={syncing}
            >
              <Icon name={syncing ? 'RefreshCw' : 'CloudUpload'} className={`w-5 h-5 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Синхронизация...' : 'Синхронизировать с GitHub'}
            </Button>
            <Button onClick={handleExport} variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10">
              <Icon name="Download" className="w-5 h-5 mr-2" />
              Экспорт CSV
            </Button>
            <Button 
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.csv';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) handleImport(file);
                };
                input.click();
              }}
              variant="outline"
              className="bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              <Icon name="Upload" className="w-5 h-5 mr-2" />
              Импорт CSV
            </Button>
          </div>
        </div>

        {showAddForm && <AddCarForm onAdd={addNewRecord} onCancel={() => setShowAddForm(false)} />}

        <AdminFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterSeries={filterSeries}
          setFilterSeries={setFilterSeries}
          filterBodyType={filterBodyType}
          setFilterBodyType={setFilterBodyType}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          uniqueSeries={uniqueSeries}
          uniqueBodyTypes={uniqueBodyTypes}
          onReset={handleResetFilters}
        />

        <AdminTable
          records={filteredRecords}
          onSave={saveRecord}
          onDelete={handleDelete}
        />

        <div className="mt-4 text-white/60 text-sm">
          Показано записей: {filteredRecords.length} из {records.length}
        </div>
      </div>
    </div>
  );
}
