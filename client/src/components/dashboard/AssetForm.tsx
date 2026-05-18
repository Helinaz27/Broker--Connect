"use client";

import { Button } from "@/components/ui/button";

interface AssetFormProps {
  activeTab: string;
  houseForm: any;
  setHouseForm: (form: any) => void;
  carForm: any;
  setCarForm: (form: any) => void;
  serviceForm: any;
  setServiceForm: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AssetForm({
  activeTab,
  houseForm,
  setHouseForm,
  carForm,
  setCarForm,
  serviceForm,
  setServiceForm,
  onSubmit,
}: AssetFormProps) {
  const isHouse = activeTab === "house_post";
  const isCar = activeTab === "car_post";
  const isService = activeTab === "service_post";

  const currentForm = isHouse ? houseForm : isCar ? carForm : serviceForm;
  const setForm = isHouse ? setHouseForm : isCar ? setCarForm : setServiceForm;

  const handleChange = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto animate-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {isHouse ? "Post House" : isCar ? "List Car" : "Offer Service"}
        </h1>
        <p className="text-muted-foreground font-medium">Complete the asset dossier for global marketplace publishing.</p>
      </div>
      <form onSubmit={onSubmit} className="bg-card border border-border rounded-3xl p-8 shadow-soft space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Asset Title</label>
            <input 
              type="text" 
              value={currentForm.title} 
              onChange={(e) => handleChange("title", e.target.value)} 
              className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary/10 outline-none transition-all" 
              required 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Valuation (Br)</label>
            <input 
              type="number" 
              value={currentForm.price} 
              onChange={(e) => handleChange("price", e.target.value)} 
              className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary/10 outline-none transition-all" 
              required 
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Description</label>
          <textarea 
            value={currentForm.description} 
            onChange={(e) => handleChange("description", e.target.value)} 
            className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary/10 outline-none transition-all h-32 resize-none" 
            required 
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-border">
          {isHouse && (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Type</label>
                <select 
                  className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm font-medium outline-none" 
                  value={houseForm.type} 
                  onChange={e => handleChange("type", e.target.value)}
                >
                  {["apartment", "villa", "studio"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Bedrooms</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm font-medium outline-none" 
                  value={houseForm.bedrooms} 
                  onChange={e => handleChange("bedrooms", e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Area (sqm)</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm font-medium outline-none" 
                  value={houseForm.area} 
                  onChange={e => handleChange("area", e.target.value)} 
                />
              </div>
            </>
          )}
          {isCar && (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Brand</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm font-medium outline-none" 
                  value={carForm.brand} 
                  onChange={e => handleChange("brand", e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Condition</label>
                <select 
                  className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm font-medium outline-none" 
                  value={carForm.condition} 
                  onChange={e => handleChange("condition", e.target.value)}
                >
                  <option value="new">New</option><option value="used">Used</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Fuel</label>
                <select 
                  className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm font-medium outline-none" 
                  value={carForm.carType} 
                  onChange={e => handleChange("carType", e.target.value)}
                >
                  <option value="electric">Electric</option><option value="fuel">Fuel</option>
                </select>
              </div>
            </>
          )}
          {isService && (
            <div className="md:col-span-3 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Experience</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm font-medium outline-none" 
                value={serviceForm.experience} 
                onChange={e => handleChange("experience", e.target.value)} 
              />
            </div>
          )}
        </div>
        <Button type="submit" className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all hover:scale-[1.01]">
          Publish Asset
        </Button>
      </form>
    </div>
  );
}
