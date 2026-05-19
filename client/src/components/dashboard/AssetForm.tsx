"use client";

import { Button } from "@/components/ui/button";
import { Plus, X, Upload } from "lucide-react";
import React from "react";

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      handleChange("images", [...(currentForm.images || []), ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = [...(currentForm.images || [])];
    updatedImages.splice(index, 1);
    handleChange("images", updatedImages);
  };

  const labelStyle = "text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1";
  const inputStyle = "w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary/10 outline-none transition-all";

  return (
    <div className="max-w-4xl mx-auto animate-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {isHouse ? "Post House" : isCar ? "List Car" : "Offer Service"}
        </h1>
        <p className="text-muted-foreground font-medium">Complete the asset dossier for global marketplace publishing.</p>
      </div>

      <form onSubmit={onSubmit} className="bg-card border border-border rounded-3xl p-8 shadow-soft space-y-8">
        {/* Common Fields: Title, Price, Mode */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-2">
            <label className={labelStyle}>Asset Title</label>
            <input 
              type="text" 
              value={currentForm.title} 
              onChange={(e) => handleChange("title", e.target.value)} 
              className={inputStyle} 
              placeholder="e.g. Modern Villa in Bole"
              required 
            />
          </div>
          <div className="space-y-2">
            <label className={labelStyle}>Price (Br)</label>
            <input 
              type="number" 
              value={currentForm.price} 
              onChange={(e) => handleChange("price", e.target.value)} 
              className={inputStyle} 
              placeholder="0.00"
              required 
            />
          </div>
        </div>

        {/* Listing Mode (Rent/Sell) for House & Car */}
        {!isService && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={labelStyle}>Listing Mode</label>
              <select 
                className={inputStyle}
                value={currentForm.listingMode}
                onChange={(e) => handleChange("listingMode", e.target.value)}
              >
                <option value="rent">For Rent</option>
                <option value="sell">For Sale</option>
              </select>
            </div>
            {isHouse && currentForm.listingMode === "rent" && (
              <div className="space-y-2 animate-in fade-in duration-300">
                <label className={labelStyle}>Rental Period</label>
                <select 
                  className={inputStyle}
                  value={currentForm.rentalPeriod}
                  onChange={(e) => handleChange("rentalPeriod", e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <label className={labelStyle}>Detailed Description</label>
          <textarea 
            value={currentForm.description} 
            onChange={(e) => handleChange("description", e.target.value)} 
            className={`${inputStyle} h-32 resize-none`} 
            placeholder="Provide comprehensive details about the asset..."
            required 
          />
        </div>

        {/* Location Section */}
        <div className="space-y-4 pt-6 border-t border-border">
          <h3 className="text-sm font-bold text-foreground italic">Location Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={labelStyle}>City</label>
              <input 
                type="text" 
                value={currentForm.locationCity} 
                onChange={(e) => handleChange("locationCity", e.target.value)} 
                className={inputStyle} 
                placeholder="e.g. Addis Ababa"
                required 
              />
            </div>
            <div className="space-y-2">
              <label className={labelStyle}>Place Name</label>
              <input 
                type="text" 
                value={currentForm.locationPlaceName} 
                onChange={(e) => handleChange("locationPlaceName", e.target.value)} 
                className={inputStyle} 
                placeholder="e.g. Bole Atlas"
                required 
              />
            </div>
            <div className="space-y-2">
              <label className={labelStyle}>Sub City (Optional)</label>
              <input 
                type="text" 
                value={currentForm.locationSubCity} 
                onChange={(e) => handleChange("locationSubCity", e.target.value)} 
                className={inputStyle} 
                placeholder="e.g. Bole"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelStyle}>Latitude (Opt)</label>
                <input 
                  type="text" 
                  value={currentForm.lat} 
                  onChange={(e) => handleChange("lat", e.target.value)} 
                  className={inputStyle} 
                  placeholder="9.01"
                />
              </div>
              <div className="space-y-2">
                <label className={labelStyle}>Longitude (Opt)</label>
                <input 
                  type="text" 
                  value={currentForm.lng} 
                  onChange={(e) => handleChange("lng", e.target.value)} 
                  className={inputStyle} 
                  placeholder="38.75"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Specific Fields */}
        <div className="pt-6 border-t border-border">
          <h3 className="text-sm font-bold text-foreground italic mb-6">Asset Specifics</h3>
          
          {isHouse && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
              <div className="space-y-2">
                <label className={labelStyle}>House Type</label>
                <select 
                  className={inputStyle}
                  value={houseForm.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                >
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="studio">Studio</option>
                  <option value="condo">Condominium</option>
                  <option value="office">Office Space</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelStyle}>Bedrooms</label>
                <input 
                  type="number" 
                  value={houseForm.bedrooms}
                  onChange={(e) => handleChange("bedrooms", e.target.value)}
                  className={inputStyle}
                />
              </div>
              <div className="space-y-2">
                <label className={labelStyle}>Bathrooms</label>
                <input 
                  type="number" 
                  value={houseForm.bathrooms}
                  onChange={(e) => handleChange("bathrooms", e.target.value)}
                  className={inputStyle}
                />
              </div>
              <div className="space-y-2">
                <label className={labelStyle}>Area (sqm)</label>
                <input 
                  type="number" 
                  value={houseForm.area_sqm}
                  onChange={(e) => handleChange("area_sqm", e.target.value)}
                  className={inputStyle}
                />
              </div>
              <div className="space-y-2">
                <label className={labelStyle}>Parking Slots</label>
                <input 
                  type="number" 
                  value={houseForm.parking}
                  onChange={(e) => handleChange("parking", e.target.value)}
                  className={inputStyle}
                  placeholder="0"
                />
              </div>
              <div className="flex items-center gap-4 h-full pt-4">
                {houseForm.listingMode === "sell" && (
                  <label className="flex items-center gap-2 cursor-pointer group animate-in slide-in-from-left-2">
                    <input 
                      type="checkbox" 
                      checked={houseForm.tanker}
                      onChange={(e) => handleChange("tanker", e.target.checked)}
                      className="h-5 w-5 rounded border-border text-primary focus:ring-primary/20"
                    />
                    <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-widest">Water Tanker</span>
                  </label>
                )}
              </div>
            </div>
          )}

          {isCar && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
              <div className="space-y-2">
                <label className={labelStyle}>Brand</label>
                <input 
                  type="text" 
                  value={carForm.brand}
                  onChange={(e) => handleChange("brand", e.target.value)}
                  className={inputStyle}
                  placeholder="e.g. Toyota"
                />
              </div>
              <div className="space-y-2">
                <label className={labelStyle}>Model</label>
                <input 
                  type="text" 
                  value={carForm.carModel}
                  onChange={(e) => handleChange("carModel", e.target.value)}
                  className={inputStyle}
                  placeholder="e.g. Land Cruiser"
                />
              </div>
              <div className="space-y-2">
                <label className={labelStyle}>Year</label>
                <input 
                  type="number" 
                  value={carForm.year}
                  onChange={(e) => handleChange("year", e.target.value)}
                  className={inputStyle}
                  placeholder="2024"
                />
              </div>
              <div className="space-y-2">
                <label className={labelStyle}>Car Type</label>
                <select 
                  className={inputStyle}
                  value={carForm.carType}
                  onChange={(e) => handleChange("carType", e.target.value)}
                >
                  <option value="fuel">Fuel (Internal Combustion)</option>
                  <option value="electric">Electric (EV)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelStyle}>Condition</label>
                <select 
                  className={inputStyle}
                  value={carForm.condition}
                  onChange={(e) => handleChange("condition", e.target.value)}
                >
                  <option value="new">Brand New</option>
                  <option value="used">Used</option>
                </select>
              </div>
            </div>
          )}

          {isService && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
              <div className="space-y-2">
                <label className={labelStyle}>Service Category</label>
                <select 
                  className={inputStyle}
                  value={serviceForm.serviceType}
                  onChange={(e) => handleChange("serviceType", e.target.value)}
                >
                  <option value="plumber">Plumbing</option>
                  <option value="electrician">Electrical</option>
                  <option value="catering">Catering</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="security">Security</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelStyle}>Years of Experience</label>
                <input 
                  type="text" 
                  value={serviceForm.experience}
                  onChange={(e) => handleChange("experience", e.target.value)}
                  className={inputStyle}
                  placeholder="e.g. 5+ years"
                />
              </div>
            </div>
          )}
        </div>

        {/* Image Upload Section */}
        <div className="pt-6 border-t border-border space-y-4">
          <label className={labelStyle}>Visual Assets (Images)</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {currentForm.images?.map((img: File, index: number) => (
              <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-border group">
                <img 
                  src={URL.createObjectURL(img)} 
                  alt={`Preview ${index}`} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                />
                <button 
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <label className="aspect-square rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="hidden" 
              />
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Upload</span>
            </label>
          </div>
        </div>

        <Button type="submit" className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] gap-2">
          <Plus className="h-4 w-4" />
          Publish Asset to Marketplace
        </Button>
      </form>
    </div>
  );
}
