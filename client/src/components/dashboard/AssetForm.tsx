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
        <h1 className="text-3xl font-black mb-2 font-poppins italic">
          {isHouse ? "Post New Home" : isCar ? "Post New Car" : "Post New Service"}
        </h1>
        <p className="text-muted-foreground font-medium font-inter">Complete the post dossier for global marketplace publishing.</p>
      </div>

      <form onSubmit={onSubmit} className="bg-card border border-border rounded-3xl p-8 shadow-soft space-y-8">
        {/* Common Fields: Title, Price, Mode */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-2">
            <label className={`${labelStyle} font-poppins`}>Post Title</label>
            <input 
              type="text" 
              value={currentForm.title} 
              onChange={(e) => handleChange("title", e.target.value)} 
              className={`${inputStyle} font-inter`} 
              placeholder="e.g. Modern Villa in Bole"
              required 
            />
          </div>
          <div className="space-y-2">
            <label className={`${labelStyle} font-poppins`}>Price (Br)</label>
            <input 
              type="number" 
              value={currentForm.price} 
              onChange={(e) => handleChange("price", e.target.value)} 
              className={`${inputStyle} font-inter`} 
              placeholder="0.00"
              required 
            />
          </div>
        </div>

        {/* Listing Mode (Rent/Sell) for House & Car */}
        {!isService && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={`${labelStyle} font-poppins`}>Listing Mode</label>
              <select 
                className={`${inputStyle} font-inter`}
                value={currentForm.listingMode}
                onChange={(e) => handleChange("listingMode", e.target.value)}
              >
                <option value="rent">For Rent</option>
                <option value="sell">For Sale</option>
              </select>
            </div>
            {isHouse && currentForm.listingMode === "rent" && (
              <div className="space-y-2 animate-in fade-in duration-300">
                <label className={`${labelStyle} font-poppins`}>Rental Period</label>
                <select 
                  className={`${inputStyle} font-inter`}
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
          <label className={`${labelStyle} font-poppins`}>Detailed Description</label>
          <textarea 
            value={currentForm.description} 
            onChange={(e) => handleChange("description", e.target.value)} 
            className={`${inputStyle} h-32 resize-none font-inter`} 
            placeholder="Provide comprehensive details about the post..."
            required 
          />
        </div>

        {/* Location Section */}
        <div className="space-y-4 pt-6 border-t border-border">
          <h3 className="text-sm font-black text-foreground italic font-poppins">Location Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={`${labelStyle} font-poppins`}>City</label>
              <input 
                type="text" 
                value={currentForm.locationCity} 
                onChange={(e) => handleChange("locationCity", e.target.value)} 
                className={`${inputStyle} font-inter`} 
                placeholder="e.g. Addis Ababa"
                required 
              />
            </div>
            <div className="space-y-2">
              <label className={`${labelStyle} font-poppins`}>Place Name</label>
              <input 
                type="text" 
                value={currentForm.locationPlaceName} 
                onChange={(e) => handleChange("locationPlaceName", e.target.value)} 
                className={`${inputStyle} font-inter`} 
                placeholder="e.g. Bole Atlas"
                required 
              />
            </div>
            <div className="space-y-2">
              <label className={`${labelStyle} font-poppins`}>Sub City (Optional)</label>
              <input 
                type="text" 
                value={currentForm.locationSubCity} 
                onChange={(e) => handleChange("locationSubCity", e.target.value)} 
                className={`${inputStyle} font-inter`} 
                placeholder="e.g. Bole"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`${labelStyle} font-poppins`}>Latitude (Opt)</label>
                <input 
                  type="text" 
                  value={currentForm.lat} 
                  onChange={(e) => handleChange("lat", e.target.value)} 
                  className={`${inputStyle} font-inter`} 
                  placeholder="9.01"
                />
              </div>
              <div className="space-y-2">
                <label className={`${labelStyle} font-poppins`}>Longitude (Opt)</label>
                <input 
                  type="text" 
                  value={currentForm.lng} 
                  onChange={(e) => handleChange("lng", e.target.value)} 
                  className={`${inputStyle} font-inter`} 
                  placeholder="38.75"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Specific Fields */}
        <div className="pt-6 border-t border-border">
          <h3 className="text-sm font-black text-foreground italic mb-6 font-poppins">Post Specifics</h3>
          
          {isHouse && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
              <div className="space-y-2">
                <label className={`${labelStyle} font-poppins`}>House Type</label>
                <select 
                  className={`${inputStyle} font-inter`}
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
                <label className={`${labelStyle} font-poppins`}>Bedrooms</label>
                <input 
                  type="number" 
                  value={houseForm.bedrooms}
                  onChange={(e) => handleChange("bedrooms", e.target.value)}
                  className={`${inputStyle} font-inter`}
                />
              </div>
              <div className="space-y-2">
                <label className={`${labelStyle} font-poppins`}>Bathrooms</label>
                <input 
                  type="number" 
                  value={houseForm.bathrooms}
                  onChange={(e) => handleChange("bathrooms", e.target.value)}
                  className={`${inputStyle} font-inter`}
                />
              </div>
              <div className="space-y-2">
                <label className={`${labelStyle} font-poppins`}>Area (sqm)</label>
                <input 
                  type="number" 
                  value={houseForm.area_sqm}
                  onChange={(e) => handleChange("area_sqm", e.target.value)}
                  className={`${inputStyle} font-inter`}
                />
              </div>
              <div className="space-y-2">
                <label className={`${labelStyle} font-poppins`}>Parking Slots</label>
                <input 
                  type="number" 
                  value={houseForm.parking}
                  onChange={(e) => handleChange("parking", e.target.value)}
                  className={`${inputStyle} font-inter`}
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
                    <span className="text-xs font-black text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-widest font-poppins">Water Tanker</span>
                  </label>
                )}
              </div>
            </div>
          )}

          {isCar && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
              <div className="space-y-2">
                <label className={`${labelStyle} font-poppins`}>Brand</label>
                <input 
                  type="text" 
                  value={carForm.brand}
                  onChange={(e) => handleChange("brand", e.target.value)}
                  className={`${inputStyle} font-inter`}
                  placeholder="e.g. Toyota"
                />
              </div>
              <div className="space-y-2">
                <label className={`${labelStyle} font-poppins`}>Model</label>
                <input 
                  type="text" 
                  value={carForm.carModel}
                  onChange={(e) => handleChange("carModel", e.target.value)}
                  className={`${inputStyle} font-inter`}
                  placeholder="e.g. Land Cruiser"
                />
              </div>
              <div className="space-y-2">
                <label className={`${labelStyle} font-poppins`}>Year</label>
                <input 
                  type="number" 
                  value={carForm.year}
                  onChange={(e) => handleChange("year", e.target.value)}
                  className={`${inputStyle} font-inter`}
                  placeholder="2024"
                />
              </div>
              <div className="space-y-2">
                <label className={`${labelStyle} font-poppins`}>Car Type</label>
                <select 
                  className={`${inputStyle} font-inter`}
                  value={carForm.carType}
                  onChange={(e) => handleChange("carType", e.target.value)}
                >
                  <option value="fuel">Fuel (Internal Combustion)</option>
                  <option value="electric">Electric (EV)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className={`${labelStyle} font-poppins`}>Condition</label>
                <select 
                  className={`${inputStyle} font-inter`}
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
                <label className={`${labelStyle} font-poppins`}>Service Category</label>
                <select 
                  className={`${inputStyle} font-inter`}
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
                <label className={`${labelStyle} font-poppins`}>Years of Experience</label>
                <input 
                  type="text" 
                  value={serviceForm.experience}
                  onChange={(e) => handleChange("experience", e.target.value)}
                  className={`${inputStyle} font-inter`}
                  placeholder="e.g. 5+ years"
                />
              </div>
            </div>
          )}
        </div>

        {/* Image Upload Section */}
        <div className="pt-6 border-t border-border space-y-4">
          <label className={`${labelStyle} font-poppins`}>Post Media (Images)</label>
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
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest font-poppins">Upload</span>
            </label>
          </div>
        </div>

        <Button type="submit" className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] gap-2 font-poppins">
          <Plus className="h-4 w-4" />
          Publish Post to Marketplace
        </Button>
      </form>
    </div>
  );
}
