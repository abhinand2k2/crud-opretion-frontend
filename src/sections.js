// Add a section: add one object here, plus an entity, repository and controller in the backend.
export const sections = [
    {
        id: "items",
        label: "Items",
        singular: "item",
        api: "items",
        fields: [
            { key: "name", label: "Name", required: true },
            { key: "description", label: "Description" },
        ],
    },
    {
        id: "products",
        label: "Products",
        singular: "product",
        api: "products",
        fields: [
            { key: "name", label: "Name", required: true },
            { key: "price", label: "Price", type: "number" },
            { key: "quantity", label: "Quantity", type: "number" },
        ],
    },
    {
        id: "students",
        label: "Students",
        singular: "student",
        api: "students",
        fields: [
            { key: "name", label: "Name", required: true },
            { key: "email", label: "Email", type: "email" },
            { key: "course", label: "Course" },
        ],
    },
];