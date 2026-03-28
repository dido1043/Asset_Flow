import { useDeferredValue, useMemo, useState } from "react";

import { Button } from "@/app/components/shared/ui/Button";
import { Input } from "@/app/components/shared/ui/Input";
import { Label } from "@/app/components/shared/ui/Label";
import { useTranslations } from "@/app/lib/i18n";

import { EmptyState, FeedbackMessage, FieldHint, SectionCard, SelectField } from "../shared";
import type { AccountWorkspaceState } from "../useAccountWorkspace";

export function ProductsSection({ workspace }: { workspace: AccountWorkspaceState }) {
  const { t } = useTranslations();
  const [productSearch, setProductSearch] = useState("");
  const {
    canManageProducts,
    feedbackByKey,
    getOrganizationName,
    handleCreateProduct,
    handleDeleteProduct,
    handleLoadAllProducts,
    handleLookupProduct,
    handleSearchProductByAssetTag,
    handleSearchProductByType,
    handleUpdateProduct,
    isEmployee,
    isLeader,
    organizationOptions,
    pendingByKey,
    populateProductForm,
    productAssetTag,
    productForm,
    productLookupId,
    productOptions,
    products,
    productTypeQuery,
    productTypeResults,
    selectedProduct,
    setProductAssetTag,
    setProductForm,
    setProductLookupId,
    setProductTypeQuery,
  } = workspace;
  const deferredProductSearch = useDeferredValue(productSearch);
  const filterProducts = useMemo(() => {
    const query = deferredProductSearch.trim().toLowerCase();

    if (!query) {
      return {
        filteredProducts: products,
        filteredTypeResults: productTypeResults,
      };
    }

    const matchesQuery = (value: string | null | undefined) => value?.toLowerCase().includes(query) ?? false;
    const productMatches = (product: (typeof products)[number]) =>
      [
        product.productBrand,
        product.productModel,
        product.productType,
        product.assetTag,
        getOrganizationName(product.organizationId),
      ].some(matchesQuery);

    return {
      filteredProducts: products.filter(productMatches),
      filteredTypeResults: productTypeResults.filter(productMatches),
    };
  }, [deferredProductSearch, getOrganizationName, productTypeResults, products]);

  return (
    <SectionCard
      id="products"
      title={t("products.title")}
      description={
        canManageProducts
          ? isLeader
            ? t("products.descriptionLeader")
            : t("products.descriptionAdmin")
          : t("products.descriptionEmployee")
      }
      actions={
        <Button variant="outline" onClick={handleLoadAllProducts} disabled={Boolean(pendingByKey.products)}>
          {pendingByKey.products ? t("common.loading") : isEmployee ? t("products.refreshMyAssets") : t("products.reloadProducts")}
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">
          <FeedbackMessage feedback={feedbackByKey.products} />

          {canManageProducts ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">{t("products.createOrUpdate")}</p>
              <FieldHint>{t("products.companyHint")}</FieldHint>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="product-id">{t("products.assetReferenceForUpdate")}</Label>
                  <Input
                    id="product-id"
                    type="number"
                    value={productForm.id}
                    onChange={(event) =>
                      setProductForm((previous) => ({ ...previous, id: event.target.value }))
                    }
                  />
                </div>
                {organizationOptions.length > 0 ? (
                  <SelectField
                    id="product-organization-id"
                    label={t("common.company")}
                    value={productForm.organizationId}
                    onChange={(value) =>
                      setProductForm((previous) => ({
                        ...previous,
                        organizationId: value,
                      }))
                    }
                    options={organizationOptions}
                    placeholder={t("registerForm.selectCompany")}
                  />
                ) : (
                  <div>
                    <Label htmlFor="product-organization-id">{t("products.companyReference")}</Label>
                    <Input
                      id="product-organization-id"
                      type="number"
                      value={productForm.organizationId}
                      onChange={(event) =>
                        setProductForm((previous) => ({
                          ...previous,
                          organizationId: event.target.value,
                        }))
                      }
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="product-type">{t("products.productType")}</Label>
                  <Input
                    id="product-type"
                    value={productForm.productType}
                    onChange={(event) =>
                      setProductForm((previous) => ({
                        ...previous,
                        productType: event.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="product-brand">{t("products.brand")}</Label>
                  <Input
                    id="product-brand"
                    value={productForm.productBrand}
                    onChange={(event) =>
                      setProductForm((previous) => ({
                        ...previous,
                        productBrand: event.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="product-model">{t("products.model")}</Label>
                  <Input
                    id="product-model"
                    value={productForm.productModel}
                    onChange={(event) =>
                      setProductForm((previous) => ({
                        ...previous,
                        productModel: event.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="product-asset-tag">{t("products.assetTag")}</Label>
                  <Input
                    id="product-asset-tag"
                    value={productForm.assetTag}
                    onChange={(event) =>
                      setProductForm((previous) => ({
                        ...previous,
                        assetTag: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button onClick={() => handleCreateProduct(false)} disabled={Boolean(pendingByKey.products)}>
                  {t("products.createProduct")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCreateProduct(true)}
                  disabled={Boolean(pendingByKey.products)}
                >
                  {t("products.createProductCompatibility")}
                </Button>
                <Button variant="secondary" onClick={handleUpdateProduct} disabled={Boolean(pendingByKey.products)}>
                  {t("products.updateProduct")}
                </Button>
              </div>
            </div>
          ) : (
            <EmptyState
              title={t("products.readOnlyTitle")}
              description={t("products.readOnlyDescription")}
            />
          )}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">{t("products.readAndDelete")}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {productOptions.length > 0 ? (
                <SelectField
                  id="product-lookup-id"
                  label={t("common.asset")}
                  value={productLookupId}
                  onChange={setProductLookupId}
                  options={productOptions}
                  placeholder={t("products.selectAsset")}
                />
              ) : (
                <div>
                  <Label htmlFor="product-lookup-id">{t("products.assetReference")}</Label>
                  <Input
                    id="product-lookup-id"
                    type="number"
                    value={productLookupId}
                    onChange={(event) => setProductLookupId(event.target.value)}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="product-asset-search">{t("products.searchAssetTag")}</Label>
                <Input
                  id="product-asset-search"
                  value={productAssetTag}
                  onChange={(event) => setProductAssetTag(event.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="product-type-query">{t("products.searchByType")}</Label>
                <Input
                  id="product-type-query"
                  value={productTypeQuery}
                  onChange={(event) => setProductTypeQuery(event.target.value)}
                />
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleLookupProduct} disabled={Boolean(pendingByKey.products)}>
                {t("products.loadDetails")}
              </Button>
              <Button
                variant="outline"
                onClick={handleSearchProductByAssetTag}
                disabled={Boolean(pendingByKey.products)}
              >
                {t("products.searchAssetTagButton")}
              </Button>
              <Button variant="outline" onClick={handleSearchProductByType} disabled={Boolean(pendingByKey.products)}>
                {t("products.searchTypeButton")}
              </Button>
              {canManageProducts ? (
                <Button variant="danger" onClick={handleDeleteProduct} disabled={Boolean(pendingByKey.products)}>
                  {t("products.deleteProduct")}
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
            <Label htmlFor="product-search">{t("common.search")}</Label>
            <Input
              id="product-search"
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
              placeholder={t("products.quickFilterPlaceholder")}
            />
            <p className="mt-2 text-xs text-slate-500">
              {t("products.resultsLabel", { count: filterProducts.filteredProducts.length })}
            </p>
          </div>

          {selectedProduct ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedProduct.productBrand} {selectedProduct.productModel}
                  </p>
                  <p className="text-sm text-slate-500">{selectedProduct.productType}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {t("common.asset")}
                </span>
              </div>
              <dl className="mt-4 grid gap-3 text-sm text-slate-600">
                <div className="flex justify-between gap-4">
                  <dt>{t("products.assetTag")}</dt>
                  <dd className="font-semibold text-slate-900">{selectedProduct.assetTag}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>{t("common.company")}</dt>
                  <dd className="font-semibold text-slate-900">{getOrganizationName(selectedProduct.organizationId)}</dd>
                </div>
              </dl>
              <div className="mt-4">
                <Button variant="outline" onClick={() => populateProductForm(selectedProduct)}>
                  {t("products.editInForm")}
                </Button>
              </div>
            </div>
          ) : (
            <EmptyState
              title={t("products.noSelectedProductTitle")}
              description={t("products.noSelectedProductDescription")}
            />
          )}

          {filterProducts.filteredTypeResults.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">{t("products.typeResults")}</p>
              <div className="mt-4 grid gap-3">
                {filterProducts.filteredTypeResults.map((product) => (
                  <div key={product.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">
                      {product.productBrand} {product.productModel}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {product.productType} • {product.assetTag}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {t("products.companyPrefix", { company: getOrganizationName(product.organizationId) })}
                    </p>
                    <div className="mt-3">
                      <Button variant="outline" onClick={() => populateProductForm(product)}>
                        {t("products.useInForm")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {products.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">{isEmployee ? t("products.myVisibleAssets") : t("products.allProducts")}</p>
              {filterProducts.filteredProducts.length > 0 ? (
                <div className="mt-4 grid max-h-[30rem] gap-3 overflow-y-auto pr-1">
                  {filterProducts.filteredProducts.map((product) => (
                    <div key={product.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {product.productBrand} {product.productModel}
                          </p>
                          <p className="text-sm text-slate-600">
                            {product.productType} • {product.assetTag}
                          </p>
                          <p className="text-sm text-slate-500">
                            {t("products.companyPrefix", { company: getOrganizationName(product.organizationId) })}
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                          {t("common.asset")}
                        </span>
                      </div>
                      <div className="mt-3">
                        <Button variant="outline" onClick={() => populateProductForm(product)}>
                          {t("products.useInForm")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4">
                  <EmptyState
                    title={t("products.noMatchesTitle")}
                    description={t("products.noMatchesDescription")}
                  />
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              title={t("products.noProductsTitle")}
              description={t("products.noProductsDescription")}
            />
          )}
        </div>
      </div>
    </SectionCard>
  );
}
