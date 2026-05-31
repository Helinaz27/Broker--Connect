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
import { useLanguage } from "@/i18n/LanguageProvider";

interface CarFormData {
  title: string;
  description: string;
  price: number;
  location: string;
  city: string;
  placeName: string;
  subCity?: string;
  carType: "electric" | "fuel";
  condition: "used" | "new";
  brand: string;
  carModel: string;
  images: File[];
  listingMode: "rent" | "sell";
}

interface CarFormProps {
  onSubmit: (data: CarFormData) => void;
  isLoading?: boolean;
  initialData?: Partial<CarFormData>;
}

export default function CarForm({
  onSubmit,
  isLoading = false,
  initialData,
}: CarFormProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<CarFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    location: initialData?.location || "",
    city: initialData?.city || "",
    placeName: initialData?.placeName || "",
    subCity: initialData?.subCity || "",
    carType: initialData?.carType || "fuel",
    condition: initialData?.condition || "used",
    brand: initialData?.brand || "",
    carModel: initialData?.carModel || "",
    images: initialData?.images || [],
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
        <CardTitle>{t("dashboard.listCar")}</CardTitle>
        <CardDescription>{t("dashboard.listCarDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Listing Mode */}
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

          {/* Title & Description */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-medium">
                Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., 2022 Toyota Camry - Sedan"
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
                placeholder={t("common.describeCar")}
                rows={4}
                required
              />
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price" className="font-medium">
              Price (ETB) *
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
                Sub City (optional)
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

          {/* Car Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="carType" className="font-medium">
                {t("common.carType")} *
              </Label>
              <Select
                value={formData.carType}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    carType: value as "electric" | "fuel",
                  })
                }
              >
                <SelectTrigger id="carType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electric">{t("common.electric")}</SelectItem>
                  <SelectItem value="fuel">{t("common.fuel")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition" className="font-medium">
                Condition *
              </Label>
              <Select
                value={formData.condition}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    condition: value as "used" | "new",
                  })
                }
              >
                <SelectTrigger id="condition">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">{t("common.newCondition")}</SelectItem>
                  <SelectItem value="used">{t("common.usedCondition")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand" className="font-medium">
                {t("common.brand")} *
              </Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                placeholder="e.g., Toyota"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="carModel" className="font-medium">
                {t("dashboard.model")}
              </Label>
              <Input
                id="carModel"
                value={formData.carModel}
                onChange={(e) =>
                  setFormData({ ...formData, carModel: e.target.value })
                }
                placeholder="e.g., Camry"
                required
              />
            </div>
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
            {isLoading ? t("dashboard.postingEllipsis") : t("dashboard.postCar")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
