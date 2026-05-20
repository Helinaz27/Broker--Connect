// components/dashboard/EditHouseListing.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useUpdateListingMutation } from "@/store/apis/listingsApi";
import type { Listing } from "@/store/apis/listingsApi";

interface EditHouseListingProps {
  listing: Listing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditHouseListing({
  listing,
  open,
  onOpenChange,
  onSuccess,
}: EditHouseListingProps) {
  const [updateListing, { isLoading }] = useUpdateListingMutation();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    houseType: "",
    bedrooms: "",
    bathrooms: "",
    area_sqm: "",
    tanker: false,
    parking: "",
    rentalPeriod: "",
    location: { city: "", subCity: "", placeName: "" },
  });
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    if (listing) {
      setFormData({
        title: listing.title || "",
        description: listing.description || "",
        price: listing.price?.toString() || "",
        houseType: listing.houseType || "",
        bedrooms: listing.bedrooms?.toString() || "",
        bathrooms: listing.bathrooms?.toString() || "",
        area_sqm: listing.area_sqm?.toString() || "",
        tanker: listing.tanker || false,
        parking: listing.parking?.toString() || "",
        rentalPeriod: listing.rentalPeriod || "",
        location: {
          city: listing.location?.city || "",
          subCity: listing.location?.subCity || "",
          placeName: listing.location?.placeName || "",
        },
      });
    }
  }, [listing]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewImages((prev) => [...prev, ...files]);

      const previews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...previews]);
    }
  };

  const removeImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing) return;

    try {
      const updateData: any = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        houseType: formData.houseType,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        area_sqm: parseInt(formData.area_sqm),
        tanker: formData.tanker,
        parking: formData.parking ? parseInt(formData.parking) : null,
        rentalPeriod: formData.rentalPeriod || null,
        location: formData.location,
      };

      if (newImages.length > 0) {
        updateData.images = newImages;
      }

      const result = await updateListing({
        id: listing.id,
        body: updateData,
      }).unwrap();

      if (result.success) {
        toast.success("House listing updated successfully");
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(result.message || "Failed to update listing");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update listing");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit House Listing</DialogTitle>
          <DialogDescription>
            Update your house listing details
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="houseType">House Type</Label>
              <Select
                value={formData.houseType}
                onValueChange={(value) =>
                  setFormData({ ...formData, houseType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={(e) =>
                  setFormData({ ...formData, bedrooms: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={(e) =>
                  setFormData({ ...formData, bathrooms: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area_sqm">Area (sqm)</Label>
              <Input
                id="area_sqm"
                type="number"
                value={formData.area_sqm}
                onChange={(e) =>
                  setFormData({ ...formData, area_sqm: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parking">Parking Spots</Label>
              <Input
                id="parking"
                type="number"
                value={formData.parking}
                onChange={(e) =>
                  setFormData({ ...formData, parking: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rentalPeriod">Rental Period</Label>
              <Select
                value={formData.rentalPeriod}
                onValueChange={(value) =>
                  setFormData({ ...formData, rentalPeriod: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="tanker"
                checked={formData.tanker}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, tanker: checked })
                }
              />
              <Label htmlFor="tanker">Has Tanker</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="City"
                value={formData.location.city}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location, city: e.target.value },
                  })
                }
              />
              <Input
                placeholder="Sub City"
                value={formData.location.subCity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location, subCity: e.target.value },
                  })
                }
              />
              <Input
                placeholder="Place Name"
                value={formData.location.placeName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: {
                      ...formData.location,
                      placeName: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Images</Label>
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
            />
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => removeImage(idx)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
