import { apiRequest } from "@/app/lib/api";
import type { ProductDto, UserDto } from "@/app/lib/types";

import type { ProductFormState } from "../types";
import { parseOptionalNumber, parseRequiredNumber, requireText } from "../utils";
import type {
  RefreshProductsList,
  RequiredFieldMessage,
  RunAction,
  SetFeedback,
  StateSetter,
  Translate,
} from "./shared";

type ProductOperationsParams = {
  currentUser: UserDto | null;
  products: ProductDto[];
  productForm: ProductFormState;
  productLookupId: string;
  productAssetTag: string;
  productTypeQuery: string;
  isAdmin: boolean;
  isLeader: boolean;
  canManageProducts: boolean;
  accessibleProductIds: Set<number>;
  runAction: RunAction;
  setFeedback: SetFeedback;
  requiredFieldMessage: RequiredFieldMessage;
  setSelectedProduct: StateSetter<ProductDto | null>;
  setProducts: StateSetter<ProductDto[]>;
  setProductTypeResults: StateSetter<ProductDto[]>;
  setOrganizationInventory: StateSetter<ProductDto[]>;
  refreshProductsList: RefreshProductsList;
  getProductName: (productId?: number | null) => string;
  t: Translate;
};

export function createProductOperations({
  currentUser,
  products,
  productForm,
  productLookupId,
  productAssetTag,
  productTypeQuery,
  isAdmin,
  isLeader,
  canManageProducts,
  accessibleProductIds,
  runAction,
  setFeedback,
  requiredFieldMessage,
  setSelectedProduct,
  setProducts,
  setProductTypeResults,
  setOrganizationInventory,
  refreshProductsList,
  getProductName,
  t,
}: ProductOperationsParams) {
  const buildProductPayload = () => ({
    productType: requireText(productForm.productType, requiredFieldMessage("fields.productType")),
    productBrand: requireText(productForm.productBrand, requiredFieldMessage("fields.brand")),
    productModel: requireText(productForm.productModel, requiredFieldMessage("fields.model")),
    assetTag: requireText(productForm.assetTag, requiredFieldMessage("fields.assetTag")),
    organizationId: isLeader ? currentUser?.organizationId ?? null : parseOptionalNumber(productForm.organizationId),
  });

  const handleCreateProduct = async () => {
    if (!canManageProducts) {
      setFeedback("products", { tone: "error", message: t("feedback.restrictedAssetView") });
      return;
    }

    const product = await runAction(
      "products",
      () =>
        apiRequest<ProductDto>("/product", {
          method: "POST",
          json: buildProductPayload(),
        }),
      t("feedback.productCreated"),
    );

    if (!product) {
      return;
    }

    setSelectedProduct(product);
    await refreshProductsList();
  };

  const handleUpdateProduct = async () => {
    if (!canManageProducts) {
      setFeedback("products", { tone: "error", message: t("feedback.onlyAdminsLeadersEditProducts") });
      return;
    }

    const productId = parseRequiredNumber(productForm.id, requiredFieldMessage("fields.asset"));

    if (!isAdmin && !accessibleProductIds.has(productId)) {
      setFeedback("products", { tone: "error", message: t("feedback.onlyCompanyAssetsUpdate") });
      return;
    }

    const payload = {
      productType: productForm.productType.trim() || undefined,
      productBrand: productForm.productBrand.trim() || undefined,
      productModel: productForm.productModel.trim() || undefined,
      assetTag: productForm.assetTag.trim() || undefined,
      organizationId: isLeader ? currentUser?.organizationId ?? null : parseOptionalNumber(productForm.organizationId),
    };

    const product = await runAction(
      "products",
      () =>
        apiRequest<ProductDto>(`/product/${productId}`, {
          method: "PUT",
          json: payload,
        }),
      t("feedback.productUpdated"),
    );

    if (!product) {
      return;
    }

    setSelectedProduct(product);
    await refreshProductsList();
  };

  const handleLoadAllProducts = async () => {
    const nextProducts = await runAction(
      "products",
      async () => {
        if (!currentUser) {
          return [];
        }

        if (currentUser.role === "ADMIN") {
          return apiRequest<ProductDto[]>("/product/all");
        }

        if (currentUser.role === "LEADER" && currentUser.organizationId != null) {
          return apiRequest<ProductDto[]>(`/product/org/${currentUser.organizationId}`);
        }

        return refreshProductsList();
      },
      isAdmin
        ? t("feedback.productsLoaded")
        : isLeader
          ? t("feedback.companyAssetsLoaded")
          : t("feedback.assignedAssetsAlreadyVisible"),
    );

    if (nextProducts) {
      setProducts(nextProducts);
    }
  };

  const handleLookupProduct = async () => {
    const productId = parseRequiredNumber(productLookupId, requiredFieldMessage("fields.asset"));

    if (!isAdmin && !accessibleProductIds.has(productId)) {
      setFeedback("products", {
        tone: "error",
        message: t("feedback.onlyVisibleAssetsOpen"),
      });
      return;
    }

    const localProduct = products.find((product) => product.id === productId);
    const product = await runAction(
      "products",
      () =>
        localProduct && !isAdmin
          ? Promise.resolve(localProduct)
          : apiRequest<ProductDto>(`/product/${productId}`),
      t("feedback.productLoaded"),
    );

    if (product) {
      setSelectedProduct(product);
    }
  };

  const handleSearchProductByAssetTag = async () => {
    const assetTag = requireText(productAssetTag, requiredFieldMessage("fields.assetTag"));
    const product = await runAction(
      "products",
      async () => {
        if (isAdmin) {
          return apiRequest<ProductDto>(`/product/asset/${encodeURIComponent(assetTag)}`);
        }

        const match = products.find((candidate) => candidate.assetTag.toLowerCase() === assetTag.toLowerCase());
        if (!match) {
          throw new Error(t("feedback.noVisibleAssetWithTag"));
        }

        return match;
      },
      t("feedback.productAssetSearchComplete"),
    );

    if (product) {
      setSelectedProduct(product);
    }
  };

  const handleSearchProductByType = async () => {
    const productType = requireText(productTypeQuery, requiredFieldMessage("fields.productType"));
    const result = await runAction(
      "products",
      async () => {
        if (isAdmin) {
          return apiRequest<ProductDto[]>(`/product/search/type/${encodeURIComponent(productType)}`);
        }

        return products.filter((product) => product.productType.toLowerCase().includes(productType.toLowerCase()));
      },
      t("feedback.productTypeSearchComplete"),
    );

    if (result) {
      setProductTypeResults(result);
    }
  };

  const handleDeleteProduct = async () => {
    if (!canManageProducts) {
      setFeedback("products", { tone: "error", message: t("feedback.onlyAdminsLeadersDeleteProducts") });
      return;
    }

    const productId = parseRequiredNumber(productLookupId || productForm.id, requiredFieldMessage("fields.asset"));

    if (!isAdmin && !accessibleProductIds.has(productId)) {
      setFeedback("products", { tone: "error", message: t("feedback.onlyCompanyAssetsDelete") });
      return;
    }

    if (!window.confirm(t("feedback.deleteProductConfirm", { name: getProductName(productId) }))) {
      return;
    }

    const result = await runAction(
      "products",
      () =>
        apiRequest<void>(`/product/${productId}`, {
          method: "DELETE",
        }),
      t("feedback.productDeleted"),
    );

    if (result === null) {
      return;
    }

    setSelectedProduct((previous) => (previous?.id === productId ? null : previous));
    setProductTypeResults((previous) => previous.filter((product) => product.id !== productId));
    setOrganizationInventory((previous) => previous.filter((product) => product.id !== productId));
    await refreshProductsList();
  };

  return {
    handleCreateProduct,
    handleUpdateProduct,
    handleLoadAllProducts,
    handleLookupProduct,
    handleSearchProductByAssetTag,
    handleSearchProductByType,
    handleDeleteProduct,
  };
}
