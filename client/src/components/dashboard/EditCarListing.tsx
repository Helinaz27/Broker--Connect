// components/dashboard/EditCarListing.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface EditCarListingProps {
  listing: Listing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditCarListing({
  listing,
  open,
  onOpenChange,
  onSuccess,
}: EditCarListingProps) {
  const [updateListing, { isLoading }] = useUpdateListingMutation();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    brand: "",
    carModel: "",
    carType: "",
    condition: "",
    listingMode: "",
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
        brand: listing.brand || "",
        carModel: listing.carModel || "",
        carType: listing.carType || "",
        condition: listing.condition || "",
        listingMode: listing.listingMode || "",
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
        brand: formData.brand,
        carModel: formData.carModel,
        carType: formData.carType,
        condition: formData.condition,
        listingMode: formData.listingMode,
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
        toast.success("Car listing updated successfully");
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
          <DialogTitle>Edit Car Listing</DialogTitle>
          <DialogDescription>Update your car listing details</DialogDescription>
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
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="carModel">Model</Label>
              <Input
                id="carModel"
                value={formData.carModel}
                onChange={(e) =>
                  setFormData({ ...formData, carModel: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="carType">Car Type</Label>
              <Select
                value={formData.carType}
                onValueChange={(value) =>
                  setFormData({ ...formData, carType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electric">Electric</SelectItem>
                  <SelectItem value="fuel">Fuel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select
                value={formData.condition}
                onValueChange={(value) =>
                  setFormData({ ...formData, condition: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="listingMode">Listing Mode</Label>
              <Select
                value={formData.listingMode}
                onValueChange={(value) =>
                  setFormData({ ...formData, listingMode: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                </SelectContent>
              </Select>
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
