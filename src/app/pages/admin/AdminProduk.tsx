import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Edit2, Trash2, Search, X, ToggleLeft, ToggleRight,
  Upload, GripVertical, AlertTriangle, Star,
} from "lucide-react";

import { v } from "../../components/pageUtils";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";

const TABS = ["Produk", "Sewa & Jasa", "Kategori", "Bahan Baku"];

export function AdminProduk() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [materials, setMaterials,] = useState<any[]>([]);

  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [showTemplateConfirm, setShowTemplateConfirm] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);

  const [showCategoryModal, setShowCategoryModal,] = useState(false);

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    active: true,
  });

  const [editingCategory, setEditingCategory] = useState<any>(null);

  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    images: [] as string[],
    description: "",
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [
    showMaterialModal,
    setShowMaterialModal,
  ] = useState(false);

  const [
    editingMaterial,
    setEditingMaterial,
  ] = useState<any>(null);

  const [
    materialForm,
    setMaterialForm,
  ] = useState({
    name: "",
    unit: "",
    stock: "",
    threshold: "",
  });

  const [services, setServices] =
    useState<ServiceData[]>([]);

  const [editingService, setEditingService] =
    useState<ServiceData | null>(
      null
    );

  const [
    isServiceModalOpen,
    setIsServiceModalOpen,
  ] = useState(false);  

  const [configs, setConfigs] =
    useState<any[]>([]);

  interface ServiceData {
    id: number;
    title: string;
    description: string;
    features: string[];
    duration: string;
    price: number;
    image?: string;
    category: string;
    featured: boolean;
    active: boolean;
  }

  const PRODUCT_TABS = [
    "Informasi",
    "Konfigurasi",
    "Spesifikasi",
  ];

  const [activeProductTab,
    setActiveProductTab] =
    useState(0);



  const getInitialConfigs = (): ConfigInputs => ({
    material: [{ name: "", extraPrice: null }],
    finishing: [{ name: "", extraPrice: null }],
    size: [{ name: "", extraPrice: null }],
    design: [{ name: "", extraPrice: null }],
  });

  const [
    configInputs,
    setConfigInputs,
  ] = useState(
    getInitialConfigs()
  );

  const [
    specifications,
    setSpecifications,
  ] = useState([
    {
      label:
        "Resolusi Cetak",
      value: "",
    },
    {
      label:
        "Mode Warna",
      value: "",
    },
    {
      label:
        "Format File",
      value: "",
    },
    {
      label:
        "Bleed Area",
      value: "",
    },
    {
      label:
        "Min. Order",
      value: "",
    },
    {
      label:
        "Estimasi Proses",
      value: "",
    },
  ]);

  /*
  =================================
  OPEN EDIT PRODUCT
  =================================
  */
  const handleEditProduct = async (
    product: any
  ) => {
    setEditingProduct(product);

    // isi form utama
    setFormData({
      name: product.name || "",
      category: product.category || "",
      price:
        product.price?.toString() || "",
      images: product.images || (product.image ? [product.image] : []),
      description:
        product.description || "",
    });

    /*
    ==========================
    CONFIGURATIONS
    ==========================
    */
    const groupedConfigs: ConfigInputs = {
      material: [],
      finishing: [],
      size: [],
      design: [],
    };

    product.configurations?.forEach(
      (config: any) => {
        const type =
          config.type as keyof ConfigInputs;

        if (groupedConfigs[type]) {
          groupedConfigs[type].push({
            name: config.name,
            extraPrice:
              config.extraPrice,
          });
        }
      }
    );

    setConfigInputs({
      material:
        groupedConfigs.material.length
          ? groupedConfigs.material
          : [
              {
                name: "",
                extraPrice: null,
              },
            ],

      finishing:
        groupedConfigs.finishing.length
          ? groupedConfigs.finishing
          : [
              {
                name: "",
                extraPrice: null,
              },
            ],

      size:
        groupedConfigs.size.length
          ? groupedConfigs.size
          : [
              {
                name: "",
                extraPrice: null,
              },
            ],

      design:
        groupedConfigs.design.length
          ? groupedConfigs.design
          : [
              {
                name: "",
                extraPrice: null,
              },
            ],
    });

    /*
    ==========================
    SPECIFICATIONS
    ==========================
    */
    setProductSpecs(
      product.specifications?.length
        ? product.specifications
        : [
            {
              label: "",
              value: "",
            },
          ]
    );

    setProductTab(0);
    setShowAddModal(true);
  };
  /*
  ==========================================
  GET PRODUCTS FROM BACKEND
  ==========================================
  */
  useEffect(() => {
    getProducts();
    getCategories();
    getMaterials();
    fetchServices();
  }, []);


  const getProducts = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/api/products"
      );

      const data = await response.json();

      // simpan ke state
      setProducts(data);

      console.log("Products:", data);
    } catch (error) {
      console.error(
        "Gagal mengambil produk:",
        error
      );
    }
  };

  const getCategories = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/api/categories"
      );

      const data =
        await response.json();

      setCats(data);
    } catch (error) {
      console.error(
        "Gagal mengambil kategori:",
        error
      );
    }
  };

  const getMaterials =
    async () => {
      try {
        const response =
          await fetch(
            "http://localhost:3001/api/materials"
          );

        const data =
          await response.json();

        setMaterials(
          data
        );
      } catch (error) {
        console.error(
          "Gagal ambil bahan baku:",
          error
        );
      }
    };

    const handleAddMaterial =
      async () => {
        try {
          if (
            !materialForm.name ||
            !materialForm.unit
          ) {
            alert(
              "Nama dan satuan wajib diisi"
            );
            return;
          }

          const response =
            await fetch(
              "http://localhost:3001/api/materials",
              {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify(
                  {
                    name:
                      materialForm.name,
                    unit:
                      materialForm.unit,
                    stock:
                      Number(
                        materialForm.stock
                      ),
                    threshold:
                      Number(
                        materialForm.threshold
                      ),
                  }
                ),
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.message
            );
          }

          getMaterials();

          setShowMaterialModal(
            false
          );

          setMaterialForm({
            name: "",
            unit: "",
            stock: "",
            threshold: "",
          });

          alert(
            "Bahan berhasil ditambahkan"
          );
        } catch (error) {
          console.error(
            error
          );

          alert(
            "Gagal tambah bahan"
          );
        }
      };

    const fetchServices =
      async () => {
        try {
          const res =
            await fetch(
              "http://localhost:3001/api/services"
            );

          const data =
            await res.json();

          setServices(
            data
          );
        } catch (error) {
          console.error(
            "Gagal mengambil jasa:",
            error
          );
        }
      };

    const deleteMaterial =
      async (
        id: number
      ) => {
        const confirmDelete =
          confirm(
            "Hapus bahan baku?"
          );

        if (
          !confirmDelete
        )
          return;

        try {
          await fetch(
            `http://localhost:3001/api/materials/${id}`,
            {
              method:
                "DELETE",
            }
          );

          getMaterials();

          alert(
            "Bahan berhasil dihapus"
          );
        } catch (error) {
          console.error(
            error
          );

          alert(
            "Gagal menghapus bahan"
          );
        }
      };

    const handleStock =
      async (
        id: number,
        type:
        | "add"
        | "reduce"
      ) => {
        try {
          await fetch(
            `http://localhost:3001/api/materials/${id}/stock`,
            {
              method:
                "PATCH",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify(
                {
                  amount: 1,
                  type,
                }
              ),
            }
          );

          getMaterials();
        } catch (error) {
          console.error(
            error
          );

          alert(
            "Gagal update stok"
          );
        }
      };

    const toggleActive = (id: number) => {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
    };
    
    /*
    =================================
    DELETE PRODUCT
    =================================
    */
    const deleteProduct = async (
      id: number
    ) => {
      // konfirmasi dulu
      const confirmDelete =
        window.confirm(
          "Yakin ingin menghapus produk ini?"
        );

      if (!confirmDelete) return;

      try {
        const response =
          await fetch(
            `http://localhost:3001/api/products/${id}`,
            {
              method: "DELETE",
            }
          );

        if (!response.ok) {
          throw new Error(
            "Gagal menghapus produk"
          );
        }

        // hapus langsung dari state
        setProducts((prev) =>
          prev.filter(
            (product) =>
              product.id !== id
          )
        );

        alert(
          "Produk berhasil dihapus"
        );
      } catch (error) {
        console.error(error);

        alert(
          "Terjadi kesalahan saat menghapus produk"
        );
      }
    };

    const filteredProducts =
      Array.isArray(products)
        ? products.filter(
            (p) =>
              p.name
                ?.toLowerCase()
                .includes(
                  search.toLowerCase()
                ) ||
              p.category
                ?.toLowerCase()
                .includes(
                  search.toLowerCase()
                )
          )
        : [];

  /*
  ==========================================
  CREATE PRODUCT
  ==========================================
  */
  const handleAddProduct = async (
    saveAsTemplate = false
  ) => {
    try {
      // validasi
      if (
        !formData.name ||
        !formData.category ||
        !formData.price
      ) {
        alert(
          "Nama, kategori dan harga wajib diisi"
        );
        return;
      }

      const cleanConfigurations = Object.entries(
        configInputs
      ).flatMap(([type, items]) =>
        items
          .filter((item) => item.name?.trim())
          .map((item) => ({
            type,
            name: item.name,
            extraPrice:
              Number(item.extraPrice) || 0,
          }))
      );

      const form = new FormData();

      form.append("name", formData.name);
      form.append("category", formData.category);
      form.append(
        "price",
        String(Number(formData.price))
      );
      form.append(
        "description",
        formData.description
      );
      form.append(
        "saveAsTemplate",
        String(saveAsTemplate)
      );

      form.append(
        "configurations",
        JSON.stringify(cleanConfigurations)
      );

      form.append(
        "specifications",
        JSON.stringify(
          productSpecs.filter(
            (spec) =>
              spec.label.trim() ||
              spec.value.trim()
          )
        )
      );

      selectedFiles.forEach((file) => {
        form.append("images", file);
      });

      let response;

      /*
      =====================
      MODE EDIT
      =====================
      */
      if (editingProduct) {
        response = await fetch(
          `http://localhost:3001/api/products/${editingProduct.id}`,
          {
            method: "PUT",
            body: form,
          }
        );
      }

      /*
      =====================
      MODE TAMBAH
      =====================
      */
      else {
        response = await fetch(
          "http://localhost:3001/api/products",
          {
            method: "POST",
            body: form,
          }
        );
      }

      if (!response.ok) {
        const errorData =
          await response.json();

        throw new Error(
          errorData.message ||
            "Gagal menyimpan produk"
        );
      }

      const savedProduct =
        await response.json();

      /*
      =====================
      UPDATE UI LANGSUNG
      =====================
      */
      if (editingProduct) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? savedProduct
              : p
          )
        );
      } else {
        setProducts((prev) => [
          savedProduct,
          ...prev,
        ]);
      }

      /*
      =====================
      RESET FORM
      =====================
      */
      formData.images.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });

      setFormData({
        name: "",
        category: "",
        price: "",
        images: [],
        description: "",
      });

      setSelectedFiles([]);

      setConfigInputs({
        material: [
          {
            name: "",
            extraPrice: 0,
          },
        ],
        finishing: [
          {
            name: "",
            extraPrice: 0,
          },
        ],
        size: [
          {
            name: "",
            extraPrice: 0,
          },
        ],
        design: [
          {
            name: "",
            extraPrice: 0,
          },
        ],
      });

      setProductSpecs([
        {
          label: "",
          value: "",
        },
      ]);

      setEditingProduct(null);
      setShowAddModal(false);

      alert(
        editingProduct
          ? "Produk berhasil diupdate"
          : "Produk berhasil ditambahkan"
      );
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan produk"
      );
    }
  };

  const handleAddCategory =
    async () => {
      try {
        if (
          !categoryForm.name
        ) {
          alert(
            "Nama kategori wajib diisi"
          );
          return;
        }

        const slug =
          categoryForm.name
            .toLowerCase()
            .replace(/\s+/g, "-");

        const response =
          await fetch(
            "http://localhost:3001/api/categories",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                name:
                  categoryForm.name,
                slug,
                active: true,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message
          );
        }

        getCategories();

        setCategoryForm({
          name: "",
          slug: "",
          active: true
        });

        setShowCategoryModal(
          false
        );

        alert(
          "Kategori berhasil ditambahkan"
        );
      } catch (error: any) {
        console.error(error);

        alert(
          error.message ||
            "Gagal tambah kategori"
        );
      }
    };

    const deleteCategory =
      async (id: number) => {
        try {
          const confirmDelete =
            confirm(
              "Hapus kategori ini?"
            );

          if (!confirmDelete)
            return;

          const response =
            await fetch(
              `http://localhost:3001/api/categories/${id}`,
              {
                method:
                  "DELETE",
              }
            );

          if (!response.ok) {
            throw new Error(
              "Gagal hapus kategori"
            );
          }

          getCategories();

          alert(
            "Kategori berhasil dihapus"
          );
        } catch (error) {
          console.error(error);
        }
      };

  const handleEditCategory =
    async () => {
      try {
        if (
          !editingCategory
        )
          return;

        const response =
          await fetch(
            `http://localhost:3001/api/categories/${editingCategory.id}`,
            {
              method:
                "PUT",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                name:
                  categoryForm.name,
                slug:
                  categoryForm.name
                    .toLowerCase()
                    .replace(
                      /\s+/g,
                      "-"
                    ),
                active:
                  categoryForm.active,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message
          );
        }

        getCategories();

        setCategoryForm({
          name: "",
          slug: "",
          active: true,
        });

        setEditingCategory(
          null
        );

        setShowCategoryModal(
          false
        );

        alert(
          "Kategori berhasil diupdate"
        );
      } catch (error: any) {
        console.error(error);

        alert(
          error.message ||
            "Gagal update kategori"
        );
      }
    };

  const getStockStatus =
    (
      stock: number,
      threshold: number
    ) => {
      if (
        stock <=
        threshold * 0.5
      ) {
        return {
          text:
            "Segera Restok",
          color:
            "#EF4444",
        };
      }

      if (
        stock <=
        threshold
      ) {
        return {
          text:
            "Hampir Habis",
          color:
            "#F59E0B",
        };
      }

      return {
        text: "Aman",
        color:
          "#10B981",
      };
    };

  const getInitialServiceData =
    (): ServiceData => ({
      id: 0,
      title: "",
      description: "",
      features: [""],
      duration: "",
      price: 0,
      image: "",
      category: "Jasa Fotografi",
      featured: false,
      active: true,
    });

    const handleSaveService =
      async () => {
        try {
          if (
            !serviceForm.title ||
            !serviceForm.price
          ) {
            alert(
              "Judul dan harga wajib diisi"
            );
            return;
          }

          const method =
            editingService
              ? "PUT"
              : "POST";

          const url =
            editingService
              ? `http://localhost:3001/api/services/${editingService.id}`
              : "http://localhost:3001/api/services";

          const response =
            await fetch(url, {
              method,
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify(
                serviceForm
              ),
            });

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.message
            );
          }

          fetchServices();

          setIsServiceModalOpen(
            false
          );

          setEditingService(
            null
          );

          setServiceForm(
            getInitialServiceData()
          );

          alert(
            editingService
              ? "Jasa berhasil diupdate"
              : "Jasa berhasil ditambahkan"
          );
        } catch (error: any) {
          console.error(error);

          alert(
            error.message ||
              "Terjadi kesalahan"
          );
        }
      };

    const handleEditService = (
      service: ServiceData
    ) => {
      setEditingService(
        service
      );

      setServiceForm(
        service
      );

      setIsServiceModalOpen(
        true
      );
    };

    const deleteService =
      async (id: number) => {
        const confirmDelete =
          window.confirm(
            "Hapus jasa ini?"
          );

        if (!confirmDelete)
          return;

        try {
          await fetch(
            `http://localhost:3001/api/services/${id}`,
            {
              method: "DELETE",
            }
          );

          fetchServices();

          alert(
            "Jasa berhasil dihapus"
          );
        } catch (error) {
          console.error(error);

          alert(
            "Gagal menghapus jasa"
          );
        }
      };

    const toggleServiceActive =
      async (
        id: number,
        active: boolean
      ) => {
        try {
          const response =
            await fetch(
              `http://localhost:3001/api/services/${id}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body:
                  JSON.stringify(
                    {
                      active:
                        !active,
                    }
                  ),
              }
            );

          if (!response.ok) {
            throw new Error(
              "Gagal update status"
            );
          }

          // update UI langsung
          setServices((prev) =>
            prev.map((service) =>
              service.id === id
                ? {
                    ...service,
                    active:
                      !active,
                  }
                : service
            )
          );
        } catch (error) {
          console.error(
            "Toggle service error:",
            error
          );
        }
      };

    const [serviceForm, setServiceForm] =
      useState<ServiceData>(
        getInitialServiceData()
      );

    const fetchConfigs =
      async (
        productId: number
      ) => {
        try {
          const res =
            await fetch(
              `http://localhost:3001/api/product-config/${productId}`
            );

          const data =
            await res.json();

          setConfigs(data);
        } catch (error) {
          console.error(error);
        }
      };

    const deleteConfig =
      async (
        id: number
      ) => {
        try {
          const res =
            await fetch(
              `http://localhost:3001/api/product-config/${id}`,
              {
                method:
                  "DELETE",
              }
            );

          if (!res.ok) {
            throw new Error(
              "Gagal hapus config"
            );
          }

          setConfigs(
            (prev) =>
              prev.filter(
                (c) =>
                  c.id !== id
              )
          );
        } catch (error) {
          console.error(
            error
          );
        }
      };

    const saveConfigs =
      async () => {
        try {

          const types = [
            "material",
            "finishing",
            "size",
            "design",
          ];

          for (
            const type
            of types
          ) {

            const filtered =
              configInputs[
                type as keyof typeof configInputs
              ].filter(
                (item) =>
                  item.name.trim()
              );

            for (
              const item
              of filtered
            ) {

              await fetch(
                `http://localhost:3001/api/product-config/product/${editingProduct?.id}`,
                {
                  method:
                    "DELETE",

                  headers: {
                    "Content-Type":
                      "application/json",
                  },

                  body:
                    JSON.stringify({
                      productId:
                        editingProduct?.id,
                      type,
                      name:
                        item.name,
                      extraPrice:
                        Number(
                          item.extraPrice
                        ),
                    }),
                }
              );
            }
          }

          await fetchConfigs(
            editingProduct?.id
          );

          alert(
            "Konfigurasi berhasil disimpan"
          );


        } catch (error) {
          console.error(
            error
          );

          alert(
            "Gagal menyimpan konfigurasi"
          );
        }
      };

    const saveConfigurations = async (saveAsTemplate: boolean) => {
        try {
          const allConfigs =
            Object.entries(
              configInputs
            ).flatMap(
              ([type, items]) =>
                items
                  .filter((item) =>
                    item.name.trim()
                  )
                  .map((item) => ({
                    productId:
                      editingProduct?.id,
                    type,
                    name:
                      item.name,
                    extraPrice:
                      Number(
                        item.extraPrice
                      ) || 0,
                  }))
            );

          await Promise.all(
            allConfigs.map(
              (config) =>
                fetch(
                  "http://localhost:3001/api/product-config",
                  {
                    method:
                      "POST",
                    headers: {
                      "Content-Type":
                        "application/json",
                    },
                    body:
                      JSON.stringify(
                        config
                      ),
                  }
                )
            )
          );

          fetchConfigs(
            editingProduct?.id
          );


          setConfigInputs(
            getInitialConfigs()
          );

          alert(
            "Konfigurasi berhasil disimpan"
          );
        } catch (error) {
          console.error(error);

          alert(
            "Gagal menyimpan konfigurasi"
          );
        }
      };

    const [productTab, setProductTab] =
      useState(0);

    interface ProductSpec {
      label: string;
      value: string;
    }

    const [productSpecs, setProductSpecs] =
      useState<ProductSpec[]>([
        {
          label: "",
          value: "",
        },
      ]);

    type ConfigItem = {
      name: string;
      extraPrice: number | null;
    };

    type ConfigInputs = {
      material: ConfigItem[];
      finishing: ConfigItem[];
      size: ConfigItem[];
      design: ConfigItem[];
    };

    // ==========================
    // FETCH TEMPLATE
    // ==========================
    const fetchTemplates = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/templates");
        const data = await res.json();
        setTemplates(data);
      } catch (err) {
        console.error("Gagal fetch template:", err);
      }
    };

    useEffect(() => {
      fetchTemplates();
    }, []);

    // ==========================
    // APPLY TEMPLATE → AUTO FILL CONFIG
    // ==========================
    const applyTemplate = (templateId: number) => {
      const template = templates.find((t) => t.id === templateId);
      if (!template) return;

      const grouped: any = {
        material: [],
        finishing: [],
        size: [],
        design: [],
      };

      template.items.forEach((item: any) => {
        if (!grouped[item.type]) return;

        grouped[item.type].push({
          name: item.name,
          extraPrice: item.extraPrice,
        });
      });

      setConfigInputs(grouped);
    };

    // ==========================
    // SAVE PRODUCT CONFIG ONLY
    // ==========================
    const saveProductConfigs = async () => {
      const types = ["material", "finishing", "size", "design"];

      try {
        for (const type of types) {
          const filtered =
            configInputs[type as keyof typeof configInputs].filter(
              (item) => item.name?.trim()
            );

          for (const item of filtered) {
            await fetch("http://localhost:3001/api/product-config", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                productId: editingProduct?.id,
                type,
                name: item.name,
                extraPrice: Number(item.extraPrice) || 0,
              }),
            });
          }
        }

        await fetchConfigs(editingProduct?.id);
      } catch (err) {
        console.error(err);
      }
    };

    // ==========================
    // SAVE AS TEMPLATE
    // ==========================
    const saveAsTemplate = async () => {
      try {
        const items = Object.entries(configInputs).flatMap(
          ([type, list]: any) =>
            list
              .filter((i: any) => i.name?.trim())
              .map((i: any) => ({
                type,
                name: i.name,
                extraPrice: Number(i.extraPrice) || 0,
              }))
        );

        await fetch("http://localhost:3001/api/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Template " + new Date().toISOString(),
            items,
          }),
        });

        fetchTemplates();
      } catch (err) {
        console.error(err);
      }
    };

    // ==========================
    // CONFIRM SAVE HANDLER
    // ==========================
    const handleConfirmSave = async (saveTemplate: boolean) => {
      setShowTemplateConfirm(false);

      await saveProductConfigs();

      if (saveTemplate) {
        await saveAsTemplate();
      }

      setShowAddModal(false);
    };


  return (
    <div className="p-5 md:p-7" style={{ background: v("--c-bg"), minHeight: "100vh" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Poppins',sans-serif] font-bold" style={{ fontSize: "clamp(1.2rem,2vw,1.5rem)", color: v("--c-text") }}>Manajemen Produk</h1>
          <p className="text-sm mt-0.5" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>Kelola produk, kategori, dan bahan baku</p>
        </div>
        <button
          onClick={() => {

            setEditingProduct(null);

            setFormData({
              name: "",
              category: "",
              price: "",
              images: [],
              description: "",
            });

            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{
            background:
              "var(--c-gradient-r)",
            fontFamily:
              "'Inter',sans-serif"
          }}
        >
          <Plus size={15} />
          Tambah Produk
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ background: v("--c-bg-sec"), border: `1px solid ${v("--c-border")}` }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)} className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={{ background: activeTab === i ? v("--c-card") : "transparent", color: activeTab === i ? v("--c-text") : v("--c-text-sec"), fontFamily: "'Inter',sans-serif", boxShadow: activeTab === i ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
            {t}
          </button>
        ))}
      </div>

      {/* TAB: PRODUK */}
      {activeTab === 0 && (
        <div>
          <div className="flex gap-3 mb-5">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: v("--c-text-sec") }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari produk..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}`, color: v("--c-text"), fontFamily: "'Inter',sans-serif" }} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="rounded-2xl overflow-hidden" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
                <div className="relative">
                  <ImageWithFallback
                    src={p.images?.[0] || p.image}
                    alt={p.name}
                  />
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "rgba(0,0,0,0.6)", color: "#fff", fontFamily: "'Inter',sans-serif" }}>{p.category}</span>
                    {p.featured && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "var(--c-gradient-r)", color: "#fff", fontFamily: "'Inter',sans-serif" }}><Star size={10} aria-hidden="true" /> Unggulan</span>}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1" style={{ color: v("--c-text"), fontFamily: "'Poppins',sans-serif" }}>{p.name}</h3>
                  <p className="text-sm font-bold mb-3" style={{ color: v("--c-primary"), fontFamily: "'Inter',sans-serif" }}>Mulai Rp. {Number(p.price).toLocaleString("id-ID")}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleActive(p.id)} className="flex items-center gap-1.5 text-xs font-medium transition-colors"
                        style={{ color: p.active ? "#10B981" : v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>
                        {p.active ? <ToggleRight size={18} style={{ color: "#10B981" }} /> : <ToggleLeft size={18} />}
                        {p.active ? "Aktif" : "Nonaktif"}
                      </button>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() =>
                          handleEditProduct(p)
                        }
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                        style={{
                          background:
                            "rgba(46,125,50,0.1)",
                          color:
                            "var(--c-primary)"
                        }}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() =>
                          deleteProduct(p.id)
                        }
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                        style={{
                          background: "rgba(239,68,68,0.1)",
                          color: "#EF4444"
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Jasa & Sewa */}
      {activeTab === 1 && (
        <div>
          <div className="flex justify-between mb-5">
            <div className="flex-1 relative">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{
                  color:
                    v("--c-text-sec"),
                }}
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Cari jasa..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background:
                    v("--c-card"),
                  border: `1px solid ${v("--c-border")}`,
                  color:
                    v("--c-text"),
                }}
              />
            </div>

            <button
              onClick={() => {
                setEditingService(
                  null
                );

                setServiceForm(
                  getInitialServiceData()
                );

                setIsServiceModalOpen(
                  true
                );
              }}
              className="ml-3 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{
                background:
                  "var(--c-gradient-r)",
              }}
            >
              <Plus size={14} />
              Tambah Jasa
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map(
              (s, i) => (
                <motion.div
                  key={s.id}
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      i * 0.06,
                  }}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background:
                      v("--c-card"),
                    border: `1px solid ${v("--c-border")}`,
                  }}
                >
                  <ImageWithFallback
                    src={
                      s.image ||
                      "/placeholder.jpg"
                    }
                    alt={s.title}
                    className="w-full h-40 object-cover"
                  />

                  <div className="p-4">
                    <h3
                      className="font-semibold text-sm mb-1"
                      style={{
                        color:
                          v(
                            "--c-text"
                          ),
                      }}
                    >
                      {s.title}
                    </h3>

                    <p
                      className="text-xs mb-3"
                      style={{
                        color:
                          v(
                            "--c-text-sec"
                          ),
                      }}
                    >
                      {s.description}
                    </p>

                    <div className="space-y-1 mb-4">
                      {s.features
                        ?.filter(
                          (f: string) =>
                            f?.trim() !== ""
                        )
                        .map(
                          (
                            f: string,
                            index: number
                          ) => (
                            <div
                              key={
                                index
                              }
                              className="flex items-center gap-2 text-xs"
                            >
                              ✓ {f}
                            </div>
                          )
                        )}
                    </div>

                    <div className="flex justify-between mb-3">
                      <span
                        className="text-xs"
                        style={{
                          color:
                            v(
                              "--c-text-sec"
                            ),
                        }}
                      >
                        {s.duration}
                      </span>

                      <span
                        className="font-bold text-sm"
                        style={{
                          color:
                            v(
                              "--c-primary"
                            ),
                        }}
                      >
                        Rp{" "}
                        {Number(
                          s.price
                        ).toLocaleString(
                          "id-ID"
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() =>
                          toggleServiceActive(
                            s.id,
                            s.active
                          )
                        }
                        className="flex items-center gap-1 text-xs"
                      >
                        {s.active ? (
                          <ToggleRight
                            size={
                              18
                            }
                          />
                        ) : (
                          <ToggleLeft
                            size={
                              18
                            }
                          />
                        )}

                        {s.active
                          ? "Aktif"
                          : "Nonaktif"}
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleEditService(
                              s
                            )
                          }
                        >
                          <Edit2
                            size={
                              14
                            }
                          />
                        </button>

                        <button
                          onClick={() =>
                            deleteService(
                              s.id
                            )
                          }
                        >
                          <Trash2
                            size={
                              14
                            }
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            )}
          </div>
        </div>
      )}


      {/* TAB: KATEGORI */}
      {activeTab === 2 && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() =>
                setShowCategoryModal(true)
              }
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{
                background:
                  "var(--c-gradient-r)",
                fontFamily:
                  "'Inter',sans-serif",
              }}
            >
              <Plus size={14} />
              Tambah Kategori
            </button>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ background: v("--c-card"), border: `1px solid ${v("--c-border")}` }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: v("--c-bg-sec"), borderBottom: `1px solid ${v("--c-border")}` }}>
                  {["", "Nama Kategori", "Slug", "Jml Produk", "Status", "Aksi"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: v("--c-text-sec"), fontFamily: "'Inter',sans-serif" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cats.map((cat, i) => (
                  <tr
                    key={cat.id}
                    style={{
                      borderBottom:
                        i < cats.length - 1
                          ? `1px solid ${v(
                              "--c-border"
                            )}`
                          : "none",
                    }}
                  >
                    <td className="px-4 py-3">
                      <GripVertical
                        size={14}
                        style={{
                          color:
                            v(
                              "--c-text-sec"
                            ),
                        }}
                        className="cursor-grab"
                      />
                    </td>

                    <td
                      className="px-4 py-3 text-sm font-medium"
                      style={{
                        color:
                          v("--c-text"),
                        fontFamily:
                          "'Inter',sans-serif",
                      }}
                    >
                      {cat.name}
                    </td>

                    <td
                      className="px-4 py-3 text-xs font-mono"
                      style={{
                        color:
                          v(
                            "--c-text-sec"
                          ),
                      }}
                    >
                      {cat.slug}
                    </td>

                    <td
                      className="px-4 py-3 text-center"
                    >
                      -
                    </td>

                    <td className="px-4 py-3">
                      <span>
                        {cat.active
                          ? "Aktif"
                          : "Nonaktif"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            setEditingCategory(cat);

                            setCategoryForm({
                              name: cat.name,
                              slug: cat.slug,
                              active:
                                cat.active,
                            });

                            setShowCategoryModal(
                              true
                            );
                          }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{
                            background:
                              "rgba(46,125,50,0.1)",
                            color:
                              "var(--c-primary)",
                          }}
                        >
                          <Edit2 size={12} />
                        </button>

                        <button
                          onClick={() =>
                            deleteCategory(
                              cat.id
                            )
                          }
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{
                            background:
                              "rgba(239,68,68,0.1)",
                            color:
                              "#EF4444",
                          }}
                        >
                          <Trash2 
                          size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: BAHAN BAKU */}
        {activeTab === 3 && (
          <div>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                  setEditingMaterial(
                    null
                  );

                  setMaterialForm({
                    name: "",
                    unit: "",
                    stock: "",
                    threshold: "",
                  });

                  setShowMaterialModal(
                    true
                  );
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{
                  background:
                    "var(--c-gradient-r)",
                  fontFamily:
                    "'Inter',sans-serif",
                }}
              >
                <Plus size={14} />
                Tambah Bahan
              </button>
            </div>

            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background:
                  v("--c-card"),
                border: `1px solid ${v("--c-border")}`,
              }}
            >
              <table className="w-full">
                <thead>
                  <tr
                    style={{
                      background:
                        v("--c-bg-sec"),
                      borderBottom: `1px solid ${v("--c-border")}`,
                    }}
                  >
                    {[
                      "Nama Bahan",
                      "Satuan",
                      "Stok Saat Ini",
                      "Threshold Alert",
                      "Status",
                      "Aksi",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold"
                        style={{
                          color:
                            v("--c-text-sec"),
                          fontFamily:
                            "'Inter',sans-serif",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {materials.map(
                    (m, i) => {
                      const isWarning =
                        m.stock <=
                        m.threshold;

                      const isDanger =
                        m.stock <=
                        m.threshold *
                          0.5;

                      return (
                        <tr
                          key={m.id}
                          style={{
                            borderBottom:
                              i <
                              materials.length -
                                1
                                ? `1px solid ${v("--c-border")}`
                                : "none",

                            background:
                              isWarning
                                ? "rgba(234,179,8,0.05)"
                                : "transparent",
                          }}
                        >
                          {/* Nama */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {isWarning && (
                                <AlertTriangle
                                  size={13}
                                  style={{
                                    color:
                                      "#EAB308",
                                  }}
                                />
                              )}

                              <span
                                className="text-sm font-medium"
                                style={{
                                  color:
                                    v("--c-text"),
                                  fontFamily:
                                    "'Inter',sans-serif",
                                }}
                              >
                                {m.name}
                              </span>
                            </div>
                          </td>

                          {/* Satuan */}
                          <td
                            className="px-4 py-3 text-sm"
                            style={{
                              color:
                                v("--c-text-sec"),
                              fontFamily:
                                "'Inter',sans-serif",
                            }}
                          >
                            {m.unit}
                          </td>

                          {/* Stok */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span
                                className="text-sm font-bold"
                                style={{
                                  color:
                                    isDanger
                                      ? "#EF4444"
                                      : isWarning
                                      ? "#EAB308"
                                      : "#10B981",

                                  fontFamily:
                                    "'Inter',sans-serif",
                                }}
                              >
                                {m.stock}
                              </span>

                              <div
                                className="flex-1 h-1.5 rounded-full overflow-hidden"
                                style={{
                                  background:
                                    v("--c-bg-sec"),
                                  minWidth: 60,
                                }}
                              >
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      (m.stock /
                                        (m.threshold *
                                          2)) *
                                        100
                                    )}%`,
                                    background:
                                      isDanger
                                        ? "#EF4444"
                                        : isWarning
                                        ? "#EAB308"
                                        : "#10B981",
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Threshold */}
                          <td
                            className="px-4 py-3 text-sm"
                            style={{
                              color:
                                v("--c-text-sec"),
                              fontFamily:
                                "'Inter',sans-serif",
                            }}
                          >
                            {m.threshold}{" "}
                            {m.unit}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            {isDanger ? (
                              <span
                                className="px-2.5 py-1 rounded-full text-xs font-semibold"
                                style={{
                                  background:
                                    "rgba(239,68,68,0.15)",
                                  color:
                                    "#EF4444",
                                  fontFamily:
                                    "'Inter',sans-serif",
                                }}
                              >
                                🚨 Segera Restok
                              </span>
                            ) : isWarning ? (
                              <span
                                className="px-2.5 py-1 rounded-full text-xs font-semibold"
                                style={{
                                  background:
                                    "rgba(234,179,8,0.15)",
                                  color:
                                    "#EAB308",
                                  fontFamily:
                                    "'Inter',sans-serif",
                                }}
                              >
                                ⚠ Hampir Habis
                              </span>
                            ) : (
                              <span
                                className="px-2.5 py-1 rounded-full text-xs font-semibold"
                                style={{
                                  background:
                                    "rgba(16,185,129,0.12)",
                                  color:
                                    "#10B981",
                                  fontFamily:
                                    "'Inter',sans-serif",
                                }}
                              >
                                ✓ Aman
                              </span>
                            )}
                          </td>

                          {/* Aksi */}
                          <td className="px-4 py-3">
                            <div className="flex gap-1.5">
                              <button
                                onClick={() =>
                                  handleStock(
                                    m.id,
                                    "add"
                                  )
                                }
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                                style={{
                                  background:
                                    "rgba(46,125,50,0.1)",
                                  color:
                                    "#10B981",
                                }}
                              >
                                + Stok
                              </button>

                              <button
                                onClick={() =>
                                  handleStock(
                                    m.id,
                                    "reduce"
                                  )
                                }
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                                style={{
                                  background:
                                    "rgba(245,158,11,0.1)",
                                  color:
                                    "#F59E0B",
                                }}
                              >
                                - Stok
                              </button>

                              <button
                                onClick={() =>
                                  deleteMaterial(
                                    m.id
                                  )
                                }
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{
                                  background:
                                    "rgba(239,68,68,0.1)",
                                  color:
                                    "#EF4444",
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* ADD / EDIT PRODUCT MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <>
            {/* BACKDROP */}
            <motion.div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() =>
                setShowAddModal(false)
              }
            />

            {/* MODAL */}
            <motion.div
                className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 rounded-2xl overflow-hidden flex flex-col md:w-[950px] md:max-h-[90vh]"
                style={{
                  background: v("--c-card"),
                  border: `1px solid ${v("--c-border")}`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
              {/* HEADER */}
              <div
                className="flex items-center justify-between p-5"
                style={{
                  borderBottom: `1px solid ${v(
                    "--c-border"
                  )}`,
                }}
              >
                <h2
                  className="font-semibold text-lg"
                  style={{
                    color: v("--c-text"),
                    fontFamily:
                      "'Poppins',sans-serif",
                  }}
                >
                  {editingProduct
                    ? "Edit Produk"
                    : "Tambah Produk"}
                </h2>

                <button
                  onClick={() =>
                    setShowAddModal(false)
                  }
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      v("--c-bg-sec"),
                    color:
                      v("--c-text-sec"),
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* TAB */}
              <div
                className="flex px-5 pt-5 gap-3"
              >
                {[
                  "Informasi",
                  "Konfigurasi",
                  "Spesifikasi",
                ].map((tab, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      setProductTab(i)
                    }
                    className="px-4 py-2 rounded-xl text-sm font-medium transition"
                    style={{
                      background:
                        productTab === i
                          ? "var(--c-gradient-r)"
                          : v(
                              "--c-bg-sec"
                            ),
                      color:
                        productTab === i
                          ? "#fff"
                          : v(
                              "--c-text"
                            ),
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* CONTENT */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">

                {/* TAB 1 - INFORMASI */}
                {productTab === 0 && (
                  <div className="space-y-5">

                    {/* Nama */}
                    <div>
                      <label className="text-xs font-semibold block mb-2">
                        Nama Produk *
                      </label>

                      <input
                        value={
                          formData.name
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            name:
                              e.target
                                .value,
                          })
                        }
                        placeholder="Nama produk"
                        className="w-full px-4 py-2.5 rounded-xl outline-none"
                        style={{
                          background:
                            v(
                              "--c-bg-sec"
                            ),
                          border: `1px solid ${v("--c-border")}`,
                          color:
                            v("--c-text"),
                        }}
                      />
                    </div>

                    {/* Kategori */}
                    <div>
                      <label className="text-xs font-semibold block mb-2">
                        Kategori *
                      </label>

                      <select
                        value={
                          formData.category
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            category:
                              e.target
                                .value,
                          })
                        }
                        className="w-full px-4 py-2.5 rounded-xl outline-none"
                        style={{
                          background:
                            v(
                              "--c-bg-sec"
                            ),
                          border: `1px solid ${v("--c-border")}`,
                          color:
                            v("--c-text"),
                        }}
                      >
                        <option value="">
                          Pilih kategori
                        </option>

                        {cats.map(
                          (c) => (
                            <option
                              key={c.id}
                              value={
                                c.name
                              }
                            >
                              {c.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {/* Harga */}
                    <div>
                      <label className="text-xs font-semibold block mb-2">
                        Harga *
                      </label>

                      <input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={
                          formData.price
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            price:
                              e.target
                                .value.replace(
                                  /\D/g,
                                  ""
                                ),
                          })
                        }
                        placeholder="20000"
                        className="w-full px-4 py-2.5 rounded-xl outline-none"
                        style={{
                          background:
                            v(
                              "--c-bg-sec"
                            ),
                          border: `1px solid ${v("--c-border")}`,
                          color:
                            v("--c-text"),
                        }}
                      />
                    </div>

                    {/* FOTO */}
                    <div>
                      <label className="text-xs font-semibold block mb-2">
                        Foto Produk
                      </label>

                      <input
                        id="product-images"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(
                            e.target.files ?? []
                          );

                          if (!files.length) return;

                          setSelectedFiles((prev) => [
                            ...prev,
                            ...files,
                          ]);

                          const previews = files.map((file) =>
                            URL.createObjectURL(file)
                          );

                          setFormData((prev) => ({
                            ...prev,
                            images: [...prev.images, ...previews],
                          }));

                          e.target.value = "";
                        }}
                      />

                      <label
                        htmlFor="product-images"
                        className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer block"
                        style={{
                          borderColor: v("--c-border"),
                          background: v("--c-bg-sec"),
                        }}
                      >
                        {formData.images.length > 0 ? (
                          <div className="grid grid-cols-3 gap-3">
                            {formData.images.map((img, index) => (
                              <div
                                key={index}
                                className="relative"
                              >
                                <img
                                  src={img}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-28 rounded-xl object-cover"
                                />

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();

                                    URL.revokeObjectURL(img);

                                    setFormData((prev) => ({
                                      ...prev,
                                      images: prev.images.filter(
                                        (_, i) => i !== index
                                      ),
                                    }));

                                    setSelectedFiles((prev) =>
                                      prev.filter(
                                        (_, i) => i !== index
                                      )
                                    );
                                  }}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <>
                            <Upload
                              size={24}
                              className="mx-auto mb-2"
                            />

                            <p>
                              Klik untuk upload satu atau
                              lebih foto
                            </p>
                          </>
                        )}
                      </label>
                    </div>

                    {/* Deskripsi */}
                    <div>
                      <label className="text-xs font-semibold block mb-2">
                        Deskripsi
                      </label>

                      <textarea
                        rows={4}
                        value={
                          formData.description
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description:
                              e.target
                                .value,
                          })
                        }
                        className="w-full px-4 py-2.5 rounded-xl resize-none outline-none"
                        style={{
                          background:
                            v(
                              "--c-bg-sec"
                            ),
                          border: `1px solid ${v("--c-border")}`,
                          color:
                            v("--c-text"),
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* TAB 2 - KONFIGURASI */}
                {productTab === 1 && (
                  <div className="space-y-6">
                    <div className="mb-4">
                      <label className="text-xs font-semibold block mb-2">
                        Template Konfigurasi
                      </label>

                      <select
                        value={selectedTemplate ?? ""}
                        onChange={(e) => {
                          const id = e.target.value ? Number(e.target.value) : null;

                          setSelectedTemplate(id);

                          if (id) {
                            applyTemplate(id);
                          } else {
                            // reset kalau tidak pakai template
                            setConfigInputs(getInitialConfigs());
                          }
                        }}
                        className="w-full px-4 py-2.5 rounded-xl outline-none"
                        style={{
                          background: v("--c-bg-sec"),
                          border: `1px solid ${v("--c-border")}`,
                        }}
                      >
                        <option value="">-- Tanpa Template --</option>

                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {[
                      "material",
                      "finishing",
                      "size",
                      "design",
                    ].map((type) => (
                      <div key={type}>
                        <h3 className="font-semibold capitalize mb-3">
                          {type}
                        </h3>

                        <div className="space-y-3">
                          {configInputs[
                            type as keyof typeof configInputs
                          ].map(
                            (
                              item,
                              index
                            ) => (
                              <div
                                key={
                                  index
                                }
                                className="grid grid-cols-2 gap-3"
                              >
                                {/* NAMA */}
                                <input
                                  type="text"
                                  value={item.name ?? ""}
                                  onChange={(e) => {
                                    const value = e.target.value;

                                    setConfigInputs((prev) => {
                                      const updated = { ...prev };

                                      const key = type as keyof ConfigInputs;

                                      updated[key] = [...updated[key]];

                                      updated[key][index] = {
                                        ...updated[key][index],
                                        name: value,
                                      };

                                      return updated;
                                    });
                                  }}
                                  placeholder="Nama"
                                  className="w-full px-4 py-2.5 rounded-xl outline-none"
                                  style={{
                                    background: v("--c-bg-sec"),
                                    border: `1px solid ${v("--c-border")}`,
                                  }}
                                />

                                {/* HARGA */}
                                <input
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={item.extraPrice ?? ""}
                                  onChange={(e) => {
                                    const raw = e.target.value.replace(/\D/g, "");

                                    setConfigInputs((prev) => {
                                      const updated = { ...prev };

                                      const key = type as keyof typeof prev;

                                      updated[key] = [...updated[key]];

                                      updated[key][index] = {
                                        ...updated[key][index],
                                        extraPrice: raw === "" ? null : Number(raw),
                                      };

                                      return updated;
                                    });
                                  }}
                                  placeholder="Harga"
                                  className="w-full px-4 py-2.5 rounded-xl outline-none"
                                  style={{
                                    background: v("--c-bg-sec"),
                                    border: `1px solid ${v("--c-border")}`,
                                  }}
                                />
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 3 - SPESIFIKASI */}
                {productTab === 2 && (
                  <div className="space-y-5">
                    {productSpecs.map(
                      (spec, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-2 gap-3"
                        >
                          {/* LABEL */}
                          <input
                            value={spec.label || ""}
                            onChange={(e) => {
                              const updated = [
                                ...productSpecs,
                              ];

                              updated[index] = {
                                ...updated[index],
                                label:
                                  e.target.value,
                              };

                              setProductSpecs(
                                updated
                              );
                            }}
                            placeholder="Nama spesifikasi"
                            className="w-full px-4 py-2.5 rounded-xl outline-none"
                            style={{
                              background:
                                v("--c-bg-sec"),
                              border: `1px solid ${v("--c-border")}`,
                            }}
                          />

                          {/* VALUE */}
                          <input
                            value={spec.value || ""}
                            onChange={(e) => {
                              const updated = [
                                ...productSpecs,
                              ];

                              updated[index] = {
                                ...updated[index],
                                value:
                                  e.target.value,
                              };

                              // auto tambah row baru
                              const isLast =
                                index ===
                                productSpecs.length -
                                  1;

                              const hasValue =
                                e.target.value.trim();

                              if (
                                isLast &&
                                hasValue
                              ) {
                                updated.push({
                                  label: "",
                                  value: "",
                                });
                              }

                              setProductSpecs(
                                updated
                              );
                            }}
                            placeholder="Isi spesifikasi"
                            className="w-full px-4 py-2.5 rounded-xl outline-none"
                            style={{
                              background:
                                v("--c-bg-sec"),
                              border: `1px solid ${v("--c-border")}`,
                            }}
                          />
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
              {/* FOOTER */}
              <div
                className="p-5 flex gap-3"
                style={{
                  borderTop: `1px solid ${v(
                    "--c-border"
                  )}`,
                }}
              >
                <button
                onClick={() => {
                  setShowTemplateConfirm(false);

                  // simpan produk tanpa template
                  handleAddProduct(false);
                }}
                className="flex-1 bg-gray-200 py-2 rounded-lg"
              >
                Tidak
              </button>

              <button
                onClick={() => {
                  setShowTemplateConfirm(false);

                  // simpan produk + template
                  handleAddProduct(true);
                }}
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg"
              >
                Ya
              </button>
              </div>
              {showTemplateConfirm && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999]">
                <div className="bg-white p-5 rounded-xl w-[320px] space-y-4">

                  <p className="font-semibold">
                    Simpan juga sebagai template konfigurasi?
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleConfirmSave(false)}
                      className="flex-1 bg-gray-200 py-2 rounded-lg"
                    >
                      Tidak
                    </button>

                    <button
                      onClick={() => handleConfirmSave(true)}
                      className="flex-1 bg-blue-500 text-white py-2 rounded-lg"
                    >
                      Ya
                    </button>
                  </div>

                </div>
              </div>
            )}
            </motion.div>
          </>
        )}
        
      </AnimatePresence>
      {/* Add Category Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() =>
                setShowCategoryModal(false)
              }
            />

            <motion.div
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 rounded-2xl overflow-hidden flex flex-col md:w-[640px] md:max-h-[85vh]"
              style={{
                background: v("--c-card"),
                border: `1px solid ${v(
                  "--c-border"
                )}`,
              }}
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between p-5"
                style={{
                  borderBottom: `1px solid ${v(
                    "--c-border"
                  )}`,
                }}
              >
                <h2
                  className="font-semibold"
                  style={{
                    color: v("--c-text"),
                    fontFamily:
                      "'Poppins',sans-serif",
                  }}
                >
                  Tambah Kategori Baru
                </h2>

                <button
                  onClick={() =>
                    setShowCategoryModal(false)
                  }
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      v("--c-bg-sec"),
                    color:
                      v("--c-text-sec"),
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">

                {/* Nama */}
                <div>
                  <label
                    className="text-xs font-semibold block mb-2"
                    style={{
                      color:
                        v("--c-text-sec"),
                      fontFamily:
                        "'Inter',sans-serif",
                    }}
                  >
                    Nama Kategori *
                  </label>

                  <input
                    value={categoryForm.name}
                    onChange={(e) => {
                      const value =
                        e.target.value;

                      setCategoryForm({
                        ...categoryForm,
                        name: value,

                        slug: value
                          .toLowerCase()
                          .replace(/\s+/g, "-")
                          .replace(
                            /[^\w-]+/g,
                            ""
                          ),
                      });
                    }}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{
                      background:
                        v("--c-bg-sec"),
                      border: `1px solid ${v(
                        "--c-border"
                      )}`,
                      color:
                        v("--c-text"),
                      fontFamily:
                        "'Inter',sans-serif",
                    }}
                    placeholder="Nama kategori"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label
                    className="text-xs font-semibold block mb-2"
                    style={{
                      color:
                        v("--c-text-sec"),
                      fontFamily:
                        "'Inter',sans-serif",
                    }}
                  >
                    Slug
                  </label>

                  <input
                    disabled
                    value={categoryForm.slug}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{
                      background:
                        v("--c-bg-sec"),
                      border: `1px solid ${v(
                        "--c-border"
                      )}`,
                      color:
                        v("--c-text-sec"),
                      fontFamily:
                        "'Inter',sans-serif",
                    }}
                  />
                </div>

                {/* Status */}
                <div>
                  <label
                    className="text-xs font-semibold block mb-2"
                    style={{
                      color:
                        v("--c-text-sec"),
                      fontFamily:
                        "'Inter',sans-serif",
                    }}
                  >
                    Status
                  </label>

                  <button
                    onClick={() =>
                      setCategoryForm({
                        ...categoryForm,
                        active:
                          !categoryForm.active,
                      })
                    }
                    className="flex items-center gap-2"
                    style={{
                      color:
                        categoryForm.active
                          ? "#10B981"
                          : v(
                              "--c-text-sec"
                            ),
                    }}
                  >
                    {categoryForm.active ? (
                      <ToggleRight
                        size={24}
                      />
                    ) : (
                      <ToggleLeft
                        size={24}
                      />
                    )}

                    {categoryForm.active
                      ? "Aktif"
                      : "Nonaktif"}
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div
                className="p-5 flex gap-3"
                style={{
                  borderTop: `1px solid ${v(
                    "--c-border"
                  )}`,
                }}
              >
                <button
                  onClick={() =>
                    setShowCategoryModal(false)
                  }
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{
                    background:
                      v("--c-bg-sec"),
                    color:
                      v("--c-text-sec"),
                    fontFamily:
                      "'Inter',sans-serif",
                  }}
                >
                  Batal
                </button>

                <button
                  onClick={() =>
                    editingCategory
                      ? handleEditCategory()
                      : handleAddCategory()
                  }
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{
                    background:
                      "var(--c-gradient-r)",
                    fontFamily:
                      "'Inter',sans-serif",
                  }}
                >
                  {
                    editingCategory
                      ? "Update Kategori"
                      : "Simpan Kategori"
                  }
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Material Modal */}
      <AnimatePresence>
        {showMaterialModal && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={() =>
                setShowMaterialModal(
                  false
                )
              }
            />

            <motion.div
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 rounded-2xl overflow-hidden flex flex-col md:w-[540px]"
              style={{
                background:
                  v("--c-card"),
                border: `1px solid ${v("--c-border")}`,
              }}
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
              }}
            >
              <div
                className="flex items-center justify-between p-5"
                style={{
                  borderBottom: `1px solid ${v("--c-border")}`,
                }}
              >
                <h2
                  className="font-semibold"
                  style={{
                    color:
                      v("--c-text"),
                  }}
                >
                  Tambah Bahan Baku
                </h2>

                <button
                  onClick={() =>
                    setShowMaterialModal(
                      false
                    )
                  }
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Nama Bahan */}
                <div>
                  <label className="text-xs font-semibold block mb-2">
                    Nama Bahan
                  </label>

                  <input
                    value={
                      materialForm.name
                    }
                    onChange={(e) =>
                      setMaterialForm({
                        ...materialForm,
                        name:
                          e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl outline-none"
                    style={{
                      background:
                        v("--c-bg-sec"),
                      border: `1px solid ${v("--c-border")}`,
                      color:
                        v("--c-text"),
                      fontFamily:
                        "'Inter',sans-serif",
                    }}
                    placeholder="Contoh: Flexi Korea, Tinta Epson, Banner"
                  />
                </div>

                {/* Satuan */}
                <div>
                  <label className="text-xs font-semibold block mb-2">
                    Satuan
                  </label>

                  <select
                    value={
                      materialForm.unit
                    }
                    onChange={(e) =>
                      setMaterialForm({
                        ...materialForm,
                        unit:
                          e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl outline-none"
                    style={{
                      background:
                        v("--c-bg-sec"),
                      border: `1px solid ${v("--c-border")}`,
                      color:
                        v("--c-text"),
                      fontFamily:
                        "'Inter',sans-serif",
                    }}
                  >
                    <option value="">
                      Pilih satuan
                    </option>

                    <option value="pcs">
                      PCS
                    </option>

                    <option value="lembar">
                      Lembar
                    </option>

                    <option value="roll">
                      Roll
                    </option>

                    <option value="meter">
                      Meter
                    </option>

                    <option value="m²">
                      Meter Persegi (m²)
                    </option>

                    <option value="kg">
                      Kilogram (Kg)
                    </option>

                    <option value="gram">
                      Gram
                    </option>

                    <option value="liter">
                      Liter
                    </option>

                    <option value="botol">
                      Botol
                    </option>

                    <option value="pack">
                      Pack
                    </option>

                    <option value="dus">
                      Dus
                    </option>

                    <option value="rim">
                      Rim
                    </option>

                    <option value="set">
                      Set
                    </option>
                  </select>
                </div>

                {/* Stok */}
                <div>
                  <label className="text-xs font-semibold block mb-2">
                    Stok Saat Ini
                  </label>

                  <input
                    type="number"
                    value={
                      materialForm.stock
                    }
                    onChange={(e) =>
                      setMaterialForm({
                        ...materialForm,
                        stock:
                          e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl outline-none"
                    style={{
                      background:
                        v("--c-bg-sec"),
                      border: `1px solid ${v("--c-border")}`,
                      color:
                        v("--c-text"),
                    }}
                  />
                </div>

                {/* Threshold */}
                <div>
                  <label className="text-xs font-semibold block mb-2">
                    Threshold Alert
                  </label>

                  <input
                    type="number"
                    value={
                      materialForm.threshold
                    }
                    onChange={(e) =>
                      setMaterialForm({
                        ...materialForm,
                        threshold:
                          e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl outline-none"
                    style={{
                      background:
                        v("--c-bg-sec"),
                      border: `1px solid ${v("--c-border")}`,
                      color:
                        v("--c-text"),
                    }}
                  />
                </div>
              </div>

              <div className="p-5 flex gap-3">
                <button
                  onClick={() =>
                    setShowMaterialModal(
                      false
                    )
                  }
                  className="flex-1 py-2.5 rounded-xl"
                >
                  Batal
                </button>

                <button
                  onClick={
                    handleAddMaterial
                  }
                  className="flex-1 py-2.5 rounded-xl text-white"
                  style={{
                    background:
                      "var(--c-gradient-r)",
                  }}
                >
                  Simpan
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
      {isServiceModalOpen && (
        <>
          {/* BACKDROP */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() =>
              setIsServiceModalOpen(false)
            }
          />

          {/* MODAL */}
          <motion.div
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 rounded-2xl overflow-hidden flex flex-col md:w-[650px] md:max-h-[90vh]"
            style={{
              background: v("--c-card"),
              border: `1px solid ${v(
                "--c-border"
              )}`,
            }}
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
            }}
          >
            {/* HEADER */}
            <div
              className="flex items-center justify-between p-5"
              style={{
                borderBottom: `1px solid ${v(
                  "--c-border"
                )}`,
              }}
            >
              <h2
                className="font-semibold"
                style={{
                  color:
                    v("--c-text"),
                  fontFamily:
                    "'Poppins',sans-serif",
                }}
              >
                {editingService
                  ? "Edit Jasa / Sewa"
                  : "Tambah Jasa / Sewa"}
              </h2>

              <button
                onClick={() =>
                  setIsServiceModalOpen(
                    false
                  )
                }
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    v("--c-bg-sec"),
                  color:
                    v("--c-text-sec"),
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">

              {/* JUDUL */}
              <div>
                <label className="text-xs font-semibold block mb-2">
                  Judul *
                </label>

                <input
                  value={
                    serviceForm.title
                  }
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      title:
                        e.target
                          .value,
                    })
                  }
                  placeholder="Contoh: Sewa Kamera Sony A7 III"
                  className="w-full px-4 py-2.5 rounded-xl outline-none"
                  style={{
                    background:
                      v(
                        "--c-bg-sec"
                      ),
                    border: `1px solid ${v("--c-border")}`,
                    color:
                      v("--c-text"),
                  }}
                />
              </div>

              {/* KATEGORI */}
              <div>
                <label className="text-xs font-semibold block mb-2">
                  Kategori *
                </label>

                <select
                  value={
                    serviceForm.category
                  }
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      category:
                        e.target
                          .value,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl outline-none"
                  style={{
                    background:
                      v(
                        "--c-bg-sec"
                      ),
                    border: `1px solid ${v("--c-border")}`,
                    color:
                      v("--c-text"),
                  }}
                >
                  <option value="">
                    Pilih kategori
                  </option>

                  <option value="Jasa">
                    Jasa
                  </option>

                  <option value="Sewa">
                    Sewa
                  </option>
                </select>
              </div>

              {/* DESKRIPSI */}
              <div>
                <label className="text-xs font-semibold block mb-2">
                  Keterangan /
                  Sub Judul
                </label>

                <textarea
                  rows={4}
                  value={
                    serviceForm.description
                  }
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      description:
                        e.target
                          .value,
                    })
                  }
                  placeholder="Contoh: Cocok untuk acara wedding, wisuda, seminar, dll"
                  className="w-full px-4 py-2.5 rounded-xl resize-none outline-none"
                  style={{
                    background:
                      v(
                        "--c-bg-sec"
                      ),
                    border: `1px solid ${v("--c-border")}`,
                    color:
                      v("--c-text"),
                  }}
                />
              </div>

              {/* BENEFIT */}
              <div>
                <label className="text-xs font-semibold block mb-2">
                  Benefit / Spesifikasi
                </label>

                <div className="space-y-2">
                  {serviceForm.features.map(
                    (item, index) => (
                      <div
                        key={index}
                        className="flex gap-2"
                      >
                        <input
                          value={item}
                          onChange={(e) => {
                            const newFeatures = [
                              ...serviceForm.features,
                            ];

                            newFeatures[index] =
                              e.target.value;

                            // auto tambah input baru
                            if (
                              index ===
                                serviceForm
                                  .features
                                  .length -
                                  1 &&
                              e.target.value.trim()
                            ) {
                              newFeatures.push("");
                            }

                            setServiceForm({
                              ...serviceForm,
                              features:
                                newFeatures,
                            });
                          }}
                          placeholder={`Benefit ${
                            index + 1
                          }`}
                          className="w-full px-4 py-2.5 rounded-xl outline-none"
                          style={{
                            background:
                              v("--c-bg-sec"),
                            border: `1px solid ${v("--c-border")}`,
                            color:
                              v("--c-text"),
                            fontFamily:
                              "'Inter',sans-serif",
                          }}
                        />

                        {/* tombol hapus */}
                        {serviceForm.features
                          .length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated =
                                serviceForm.features.filter(
                                  (_, i) =>
                                    i !==
                                    index
                                );

                              setServiceForm({
                                ...serviceForm,
                                features:
                                  updated.length
                                    ? updated
                                    : [""],
                              });
                            }}
                            className="w-11 rounded-xl flex items-center justify-center"
                            style={{
                              background:
                                "rgba(239,68,68,0.1)",
                              color:
                                "#EF4444",
                            }}
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    )
                  )}
                </div>

                <p
                  className="text-xs mt-2"
                  style={{
                    color:
                      v("--c-text-sec"),
                  }}
                >
                  Isi benefit satu per satu.
                  Input baru akan muncul
                  otomatis.
                </p>
              </div>

              {/* DURASI */}
              <div>
                <label className="text-xs font-semibold block mb-2">
                  Durasi
                </label>

                <select
                  value={
                    serviceForm.duration
                  }
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      duration:
                        e.target
                          .value,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl outline-none"
                  style={{
                    background:
                      v(
                        "--c-bg-sec"
                      ),
                    border: `1px solid ${v("--c-border")}`,
                    color:
                      v("--c-text"),
                  }}
                >
                  <option value="">
                    Pilih durasi
                  </option>

                  <option value="Per Jam">
                    Per Jam
                  </option>

                  <option value="Harian">
                    Harian
                  </option>

                  <option value="Mingguan">
                    Mingguan
                  </option>

                  <option value="Bulanan">
                    Bulanan
                  </option>

                  <option value="Full Day">
                    Full Day
                  </option>
                </select>
              </div>

              {/* HARGA */}
              <div>
                <label className="text-xs font-semibold block mb-2">
                  Harga *
                </label>

                <input
                  type="number"
                  value={
                    serviceForm.price
                  }
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      price:
                        Number(
                          e.target
                            .value
                        ),
                    })
                  }
                  placeholder="Contoh: 150000"
                  className="w-full px-4 py-2.5 rounded-xl outline-none"
                  style={{
                    background:
                      v(
                        "--c-bg-sec"
                      ),
                    border: `1px solid ${v("--c-border")}`,
                    color:
                      v("--c-text"),
                  }}
                />
              </div>

              {/* FOTO */}
              <div>
                <label className="text-xs font-semibold block mb-2">
                  Foto Jasa / Sewa
                </label>

                <input
                  type="file"
                  accept="image/*"
                  id="service-image"
                  className="hidden"
                  onChange={(e) => {
                    const file =
                      e.target
                        .files?.[0];

                    if (!file)
                      return;

                    const imageUrl =
                      URL.createObjectURL(
                        file
                      );

                    setServiceForm(
                      {
                        ...serviceForm,
                        image:
                          imageUrl,
                      }
                    );
                  }}
                />

                <label
                  htmlFor="service-image"
                  className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer block"
                  style={{
                    borderColor:
                      v(
                        "--c-border"
                      ),
                    background:
                      v(
                        "--c-bg-sec"
                      ),
                  }}
                >
                  {serviceForm.image ? (
                    <img
                      src={
                        serviceForm.image
                      }
                      className="w-full h-40 rounded-xl object-cover"
                    />
                  ) : (
                    <>
                      <Upload
                        size={24}
                        className="mx-auto mb-2"
                      />

                      <p>
                        Klik untuk
                        upload
                        foto
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* FOOTER */}
            <div
              className="p-5 flex gap-3"
              style={{
                borderTop: `1px solid ${v(
                  "--c-border"
                )}`,
              }}
            >
              <button
                onClick={() =>
                  setIsServiceModalOpen(
                    false
                  )
                }
                className="flex-1 py-2.5 rounded-xl"
                style={{
                  background:
                    v(
                      "--c-bg-sec"
                    ),
                }}
              >
                Batal
              </button>

              <button
                onClick={
                  handleSaveService
                }
                className="flex-1 py-2.5 rounded-xl text-white"
                style={{
                  background:
                    "var(--c-gradient-r)",
                }}
              >
                {editingService
                  ? "Update"
                  : "Simpan"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </div>
  );
}