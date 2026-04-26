# FINAL_YEAR_PROJECT
// users collection
{
    _id: ObjectId,
    name: string,
    email: string,
    phone: string,
    password_hash: string,
    roles: [string],
    created_at: date,
    updated_at: date
}

// cars collection
{
    _id: ObjectId,
    title: string,
    description: string,
    price: number,
    listing_type: string,
    user_id: ObjectId,
    status: string,
    views: number,
    images: [string],
    location: {
        address: string,
        city: string,
        state: string,
        country: string,
        pincode: string,
        coordinates: [number]
    },
    brand: string,
    model: string,
    year: number,
    mileage: number,
    fuel_type: string,
    transmission: string,
    seats: number,
    color: string,
    created_at: date,
    updated_at: date
}

// homes collection
{
    _id: ObjectId,
    title: string,
    description: string,
    price: number,
    listing_type: string,
    user_id: ObjectId,
    status: string,
    views: number,
    images: [string],
    location: {
        address: string,
        city: string,
        state: string,
        country: string,
        pincode: string,
        coordinates: [number]
    },
    property_type: string,
    bedrooms: number,
    bathrooms: number,
    square_feet: number,
    furnished: boolean,
    amenities: [string],
    created_at: date,
    updated_at: date
}

// verification collection
{
    _id: ObjectId,
    user_id: ObjectId,
    status: string,
    address: {
        full_address: string,
        city: string,
        state: string
    },
    documents: {
        front_image: string,
        back_image: string
    },
    submitted_at: date,
    reviewed_at: date,
    reviewed_by: ObjectId,
    rejection_reason: string
}
{
    _id: ObjectId,
    session_uuid: string,
    session_title: string,
    session_type: string,
    created_by: ObjectId,
    is_active: boolean,
    created_date: date,
    last_activity: date,
    participants: [
        {
            participant_id: ObjectId,
            user_id: ObjectId,
            participant_role: string,
            joined_at: date,
            left_at: date,
            is_active: boolean
        }
    ],
    messages: [
        {
            message_id: ObjectId,
            sender_id: ObjectId,
            message_type: string,
            message_content: string,
            file_path: string,
            file_size: number,
            original_filename: string,
            is_read: boolean,
            read_at: date,
            sent_at: date,
            updated_at: date,
            parent_message_id: ObjectId,
            is_edited: boolean,
            is_deleted: boolean,
            deleted_at: date,
            read_receipts: [
                {
                    user_id: ObjectId,
                    read_at: date
                }
            ]
        }
    ]
}
