import { useState } from 'react';
import { Bus, MapPin, Plus, User, Phone } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function TransportModule() {
  const [vehicles, setVehicles] = useState([
    { id: 1, number: 'TX-9023', model: 'TATA Marcopolo Bus', capacity: 48, driver: 'Arthur Pendelton', phone: '555-0923', route: 'North Gate Campus Route' }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ number: '', model: '', capacity: 40, driver: '', phone: '', route: '' });

  const handleCreateVehicle = (e) => {
    e.preventDefault();
    setVehicles([...vehicles, { id: Date.now(), ...newVehicle }]);
    setShowAddForm(false);
    setNewVehicle({ number: '', model: '', capacity: 40, driver: '', phone: '', route: '' });
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Transport Logistics</h2>
          <p className="text-sm text-text-muted">Manage school bus fleets, register transport drivers, and configure pickup/drop stops.</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} size="sm" className="flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add Vehicle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {vehicles.map((v) => (
          <div key={v.id} className="p-5 rounded-2xl bg-card border border-border/60 hover:shadow-md transition-all space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Bus className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="font-extrabold text-foreground text-sm block">{v.number}</span>
                  <span className="text-xs text-text-muted">{v.model} (Max Cap: {v.capacity})</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border/20 pt-3 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-foreground">
                <User className="w-4 h-4 text-primary" />
                <span className="font-semibold">{v.driver}</span>
                <span className="text-text-muted">| {v.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <MapPin className="w-4 h-4 text-purple-500" />
                <span className="font-medium">{v.route || 'No active route'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-foreground">Add Transit Vehicle</h3>
              <button onClick={() => setShowAddForm(false)} className="text-text-muted hover:text-foreground cursor-pointer">×</button>
            </div>
            
            <form onSubmit={handleCreateVehicle} className="space-y-4">
              <Input label="Vehicle Plate Number *" value={newVehicle.number} onChange={(e) => setNewVehicle({ ...newVehicle, number: e.target.value })} placeholder="e.g. TX-9023" required />
              <Input label="Vehicle Model Description" value={newVehicle.model} onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })} placeholder="e.g. TATA Mini Bus" />
              <Input label="Max Capacity *" type="number" value={newVehicle.capacity} onChange={(e) => setNewVehicle({ ...newVehicle, capacity: parseInt(e.target.value) })} required />
              
              <div className="grid grid-cols-2 gap-3">
                <Input label="Driver Name" value={newVehicle.driver} onChange={(e) => setNewVehicle({ ...newVehicle, driver: e.target.value })} />
                <Input label="Driver Phone" value={newVehicle.phone} onChange={(e) => setNewVehicle({ ...newVehicle, phone: e.target.value })} />
              </div>
              
              <Input label="Assigned Route" value={newVehicle.route} onChange={(e) => setNewVehicle({ ...newVehicle, route: e.target.value })} placeholder="e.g. South Campus Route" />

              <Button type="submit">Onboard Vehicle</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
