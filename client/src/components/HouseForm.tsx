"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/i18n/LanguageProvider";

interface HouseFormData {
  title: string;
  description: string;
  price: number;
  location: string;
  city: string;
  placeName: string;
  subCity?: string;
  coordinates?: { lat: number; lng: number };
  houseType: "condominium" | "villa" | "business" | "apartment" | "others";
  houseTypeOther?: string;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  tanker?: boolean;
  rentalPeriod?: "daily" | "weekly" | "monthly" | "yearly";
  images: File[];
  parking: boolean;
  listingMode: "rent" | "sell";
}

interface HouseFormProps {
  onSubmit: (data: HouseFormData) => void;
  isLoading?: boolean;
  initialData?: Partial<HouseFormData>;
}

export default function HouseForm({
  onSubmit,
  isLoading = false,
  initialData,
}: HouseFormProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<HouseFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    location: initialData?.location || "",
    city: initialData?.city || "",
    placeName: initialData?.placeName || "",
    subCity: initialData?.subCity || "",
    houseType: initialData?.houseType || "apartment",
    bedrooms: initialData?.bedrooms || 1,
    bathrooms: initialData?.bathrooms || 1,
    areaSqm: initialData?.areaSqm || 0,
    tanker: initialData?.tanker || false,
    rentalPeriod: initialData?.rentalPeriod || "monthly",
    images: initialData?.images || [],
    parking: initialData?.parking || false,
    listingMode: initialData?.listingMode || "rent",
  });

  const [imagePreview, setImagePreview] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData({ ...formData, images: files });
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>{t("dashboard.listHouse")}</CardTitle>
        <CardDescription>{t("dashboard.listHouseDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Listing Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="listingMode" className="font-medium">
                {t("common.listingMode")} *
              </Label>
              <Select
                value={formData.listingMode}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    listingMode: value as "rent" | "sell",
                  })
                }
              >
                <SelectTrigger id="listingMode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rent">{t("common.rent")}</SelectItem>
                  <SelectItem value="sell">{t("common.sell")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rental Period (only for rent) */}
            {formData.listingMode === "rent" && (
              <div className="space-y-2">
                <Label htmlFor="rentalPeriod" className="font-medium">
                  {t("common.rentalPeriod")} *
                </Label>
                <Select
                  value={formData.rentalPeriod || "monthly"}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      rentalPeriod: value as
                        | "daily"
                        | "weekly"
                        | "monthly"
                        | "yearly",
                    })
                  }
                >
                  <SelectTrigger id="rentalPeriod">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">{t("common.daily")}</SelectItem>
                    <SelectItem value="weekly">{t("common.weekly")}</SelectItem>
                    <SelectItem value="monthly">{t("common.monthly")}</SelectItem>
                    <SelectItem value="yearly">{t("common.yearly")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Title & Description */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-medium">
                {t("dashboard.titleRequired")}
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder={t("common.titlePlaceholderHouse")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-medium">
                {t("dashboard.descriptionRequired")}
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder={t("common.describeHouse")}
                rows={4}
                required
              />
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price" className="font-medium">
              {t("dashboard.priceEtb")}
            </Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: parseFloat(e.target.value) })
              }
              placeholder="0"
              required
            />
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="font-medium">
                {t("dashboard.cityRequired")}
              </Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                placeholder={t("common.cityPlaceholder")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="placeName" className="font-medium">
                {t("dashboard.placeName")}
              </Label>
              <Input
                id="placeName"
                value={formData.placeName}
                onChange={(e) =>
                  setFormData({ ...formData, placeName: e.target.value })
                }
                placeholder="e.g., Bole"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subCity" className="font-medium">
                {t("dashboard.subCity")}
              </Label>
              <Input
                id="subCity"
                value={formData.subCity}
                onChange={(e) =>
                  setFormData({ ...formData, subCity: e.target.value })
                }
                placeholder="e.g., District 5"
              />
            </div>
          </div>

          {/* House Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="houseType" className="font-medium">
                {t("common.houseType")} *
              </Label>
              <Select
                value={formData.houseType}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    houseType: value as
                      | "condominium"
                      | "villa"
                      | "business"
                      | "apartment"
                      | "others",
                  })
                }
              >
                <SelectTrigger id="houseType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="condominium">
                    {t("common.condominium")}
                  </SelectItem>
                  <SelectItem value="villa">{t("common.villa")}</SelectItem>
                  <SelectItem value="business">{t("common.business")}</SelectItem>
                  <SelectItem value="apartment">
                    {t("common.apartment")}
                  </SelectItem>
                  <SelectItem value="others">{t("common.others")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.houseType === "others" && (
              <div className="space-y-2">
                <Label htmlFor="houseTypeOther" className="font-medium">
                  Specify Type
                </Label>
                <Input
                  id="houseTypeOther"
                  value={formData.houseTypeOther}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      houseTypeOther: e.target.value,
                    })
                  }
                  placeholder="e.g., Townhouse"
                />
              </div>
            )}
          </div>

          {/* Bedrooms, Bathrooms, Area */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms" className="font-medium">
                {t("common.bedroomsLabel")} *
              </Label>
              <Input
                id="bedrooms"
                type="number"
                min="0"
                value={formData.bedrooms}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bedrooms: parseInt(e.target.value),
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms" className="font-medium">
                {t("common.bathroomsLabel")} *
              </Label>
              <Input
                id="bathrooms"
                type="number"
                min="0"
                value={formData.bathrooms}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bathrooms: parseInt(e.target.value),
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="areaSqm" className="font-medium">
                Area (sqm) *
              </Label>
              <Input
                id="areaSqm"
                type="number"
                min="0"
                value={formData.areaSqm}
                onChange={(e) =>
                  setFormData({ ...formData, areaSqm: parseFloat(e.target.value) })
                }
                required
              />
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="parking"
                checked={formData.parking}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, parking: checked as boolean })
                }
              />
              <Label htmlFor="parking" className="font-medium cursor-pointer">
                {t("dashboard.hasParking")}
              </Label>
            </div>

            {formData.listingMode === "sell" && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="tanker"
                  checked={formData.tanker}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, tanker: checked as boolean })
                  }
                />
                <Label htmlFor="tanker" className="font-medium cursor-pointer">
                  {t("dashboard.hasWaterTanker")}
                </Label>
              </div>
            )}
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label htmlFor="images" className="font-medium">
              {t("dashboard.imagesRequired")}
            </Label>
            <Input
              id="images"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              required
            />
            {imagePreview.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                {imagePreview.map((preview, idx) => (
                  <img
                    key={idx}
                    src={preview}
                    alt={`Preview ${idx}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? t("dashboard.postingEllipsis") : t("dashboard.postHouse")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
