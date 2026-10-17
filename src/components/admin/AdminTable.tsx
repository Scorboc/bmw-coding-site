import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import type { ChiptuningRecord } from './AddCarForm';

interface AdminTableProps {
  records: ChiptuningRecord[];
  onSave: (updatedRecord: ChiptuningRecord) => Promise<boolean>;
  onDelete: (id: number) => Promise<void>;
}

export default function AdminTable({ records, onSave, onDelete }: AdminTableProps) {
  const [editingCell, setEditingCell] = useState<{ id: number; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [savedCells, setSavedCells] = useState<Set<string>>(new Set());

  const handleCellClick = (id: number, field: string, currentValue: unknown) => {
    setEditingCell({ id, field });
    setEditValue(String(currentValue ?? ''));
  };

  const handleCellSave = async () => {
    if (!editingCell) return;

    const record = records.find(r => r.id === editingCell.id);
    if (!record) return;

    const updatedRecord = { ...record };
    const fieldPath = editingCell.field.split('.');
    
    if (fieldPath.length === 2) {
      const [parent, child] = fieldPath;
      if ((parent === 'stock' || parent === 'stage1' || parent === 'stage2') && ['power', 'torque', 'price'].includes(child)) {
        const value = Number(editValue);
        if (!Number.isFinite(value) || value < 0) return;
        if (parent === 'stage1') updatedRecord.stage1 = { ...record.stage1, [child]: value };
        else if (parent === 'stock') updatedRecord.stock = { ...record.stock, [child]: value };
        else updatedRecord.stage2 = { power: 0, torque: 0, ...record.stage2, [child]: value };
      }
    } else {
      const fields = ['model_name', 'series', 'body_type', 'engine_code', 'article_code', 'stage_type', 'status', 'firmware_type'] as const;
      const field = fields.find(name => name === editingCell.field);
      if (!field) return;
      updatedRecord[field] = editValue;
    }

    const success = await onSave(updatedRecord);
    
    if (success) {
      const cellKey = `${editingCell.id}-${editingCell.field}`;
      setSavedCells(prev => new Set(prev).add(cellKey));
      setTimeout(() => {
        setSavedCells(prev => {
          const newSet = new Set(prev);
          newSet.delete(cellKey);
          return newSet;
        });
      }, 2000);
    }

    setEditingCell(null);
  };

  const renderCell = (record: ChiptuningRecord, field: string, value: string | number | null | undefined) => {
    const cellKey = `${record.id}-${field}`;
    const isEditing = editingCell?.id === record.id && editingCell?.field === field;
    const isSaved = savedCells.has(cellKey);

    return (
      <td
        key={field}
        className={`px-4 py-3 text-white/90 cursor-pointer hover:bg-white/10 transition-colors ${
          isSaved ? 'bg-green-500/30 animate-pulse' : ''
        }`}
        onClick={() => !isEditing && handleCellClick(record.id, field, value)}
      >
        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleCellSave}
            onKeyDown={(e) => e.key === 'Enter' && handleCellSave()}
            autoFocus
            className="w-full bg-blue-600/30 border border-blue-500 rounded px-2 py-1 text-white"
          />
        ) : (
          <span>{value ?? '-'}</span>
        )}
      </td>
    );
  };

  const renderCheckbox = (record: ChiptuningRecord, field: 'status' | 'show_stage2', checked: boolean) => {
    const cellKey = `${record.id}-${field}`;
    const isSaved = savedCells.has(cellKey);

    const toggleCheckbox = async () => {
      let updatedRecord: ChiptuningRecord;
      
      if (field === 'status') {
        updatedRecord = { ...record, status: checked ? '0' : '1' };
      } else {
        updatedRecord = { ...record, show_stage2: !checked };
      }
      
      const success = await onSave(updatedRecord);
      
      if (success) {
        setSavedCells(prev => new Set(prev).add(cellKey));
        setTimeout(() => {
          setSavedCells(prev => {
            const newSet = new Set(prev);
            newSet.delete(cellKey);
            return newSet;
          });
        }, 2000);
      }
    };

    return (
      <td
        key={field}
        className={`px-4 py-3 text-center cursor-pointer hover:bg-white/10 transition-colors ${
          isSaved ? 'bg-green-500/30 animate-pulse' : ''
        }`}
        onClick={toggleCheckbox}
      >
        <div className="flex items-center justify-center">
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
            checked ? 'bg-green-500 border-green-500' : 'border-white/30'
          }`}>
            {checked && <Icon name="Check" className="w-4 h-4 text-white" />}
          </div>
        </div>
      </td>
    );
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/10">
            <tr>
              <th className="px-4 py-3 text-left text-white/80 font-medium">ID</th>
              <th className="px-4 py-3 text-left text-white/80 font-medium">Модель</th>
              <th className="px-4 py-3 text-left text-white/80 font-medium">Серия</th>
              <th className="px-4 py-3 text-left text-white/80 font-medium">Кузов</th>
              <th className="px-4 py-3 text-left text-white/80 font-medium">Двигатель</th>
              <th className="px-4 py-3 text-left text-white/80 font-medium">Сток л.с.</th>
              <th className="px-4 py-3 text-left text-white/80 font-medium">Сток Нм</th>
              <th className="px-4 py-3 text-left text-white/80 font-medium">Stage1 л.с.</th>
              <th className="px-4 py-3 text-left text-white/80 font-medium">Stage1 Нм</th>
              <th className="px-4 py-3 text-left text-white/80 font-medium">Цена</th>
              <th className="px-4 py-3 text-left text-white/80 font-medium">Stage2 л.с.</th>
              <th className="px-4 py-3 text-left text-white/80 font-medium">Stage2 Нм</th>
              <th className="px-4 py-3 text-left text-white/80 font-medium">Stage2 Цена</th>
              <th className="px-4 py-3 text-center text-white/80 font-medium">На сайте</th>
              <th className="px-4 py-3 text-center text-white/80 font-medium">Stage2 на сайте</th>
              <th className="px-4 py-3 text-left text-white/80 font-medium">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-white/5">
                <td className="px-4 py-3 text-white/60">{record.id}</td>
                {renderCell(record, 'model_name', record.model_name)}
                {renderCell(record, 'series', record.series)}
                {renderCell(record, 'body_type', record.body_type)}
                {renderCell(record, 'engine_code', record.engine_code)}
                {renderCell(record, 'stock.power', record.stock.power)}
                {renderCell(record, 'stock.torque', record.stock.torque)}
                {renderCell(record, 'stage1.power', record.stage1.power)}
                {renderCell(record, 'stage1.torque', record.stage1.torque)}
                {renderCell(record, 'stage1.price', record.stage1.price)}
                {renderCell(record, 'stage2.power', record.stage2?.power)}
                {renderCell(record, 'stage2.torque', record.stage2?.torque)}
                {renderCell(record, 'stage2.price', record.stage2?.price)}
                {renderCheckbox(record, 'status', record.status === '1')}
                {renderCheckbox(record, 'show_stage2', record.show_stage2)}
                <td className="px-4 py-3">
                  <Button
                    onClick={async () => {
                      if (confirm('Удалить запись?')) {
                        await onDelete(record.id);
                      }
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    <Icon name="Trash2" className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
