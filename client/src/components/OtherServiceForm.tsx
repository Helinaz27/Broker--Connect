"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/i18n/LanguageProvider";

interface OtherServiceFormData {
  title: string;
  description: string;
  price: number;
  location: string;
  city: string;
  placeName: string;
  subCity?: string;
  serviceType: string;
  images: File[];
}

interface OtherServiceFormProps {
  onSubmit: (data: OtherServiceFormData) => void;
  isLoading?: boolean;
  initialData?: Partial<OtherServiceFormData>;
}

export default function OtherServiceForm({
  onSubmit,
  isLoading = false,
  initialData,
}: OtherServiceFormProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<OtherServiceFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    location: initialData?.location || "",
    city: initialData?.city || "",
    placeName: initialData?.placeName || "",
    subCity: initialData?.subCity || "",
    serviceType: initialData?.serviceType || "",
    images: initialData?.images || [],
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
        <CardTitle>{t("dashboard.listOtherService")}</CardTitle>
        <CardDescription>{t("dashboard.listOtherServiceDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title & Description */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-medium">
                {t("dashboard.serviceTitle")}
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder={t("common.titlePlaceholderService")}
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
                placeholder={t("common.describeService")}
                rows={4}
                required
              />
            </div>
          </div>

          {/* Service Type */}
          <div className="space-y-2">
            <Label htmlFor="serviceType" className="font-medium">
              {t("common.serviceType")} *
            </Label>
            <Input
              id="serviceType"
              value={formData.serviceType}
              onChange={(e) =>
                setFormData({ ...formData, serviceType: e.target.value })
              }
              placeholder={t("common.serviceTypePlaceholder")}
              required
            />
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
                placeholder="e.g., Kazanchis"
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

          {/* Images */}
          <div className="space-y-2">
            <Label htmlFor="images" className="font-medium">
              Images *
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
            {isLoading
              ? t("dashboard.postingEllipsis")
              : t("dashboard.postService")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
