import { Button } from "@/app/components/shared/ui/Button";
import { Input } from "@/app/components/shared/ui/Input";
import { Label } from "@/app/components/shared/ui/Label";

import { EmptyState, FeedbackMessage, FieldHint, SectionCard, SelectField } from "../shared";
import type { AccountWorkspaceState } from "../useAccountWorkspace";

export function ProductsSection({ workspace }: { workspace: AccountWorkspaceState }) {
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

  return (
    <SectionCard
      id="products"
      title="Products"
      description={
        canManageProducts
          ? isLeader
            ? "Create, update, search, and maintain inventory records inside your company."
            : "Create, update, search, and maintain inventory records from one place."
          : "Review the assets that are currently visible to your account."
      }
      actions={
        <Button variant="outline" onClick={handleLoadAllProducts} disabled={Boolean(pendingByKey.products)}>
          {pendingByKey.products ? "Loading..." : isEmployee ? "Refresh my assets" : "Reload products"}
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">
          <FeedbackMessage feedback={feedbackByKey.products} />

          {canManageProducts ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Create or update product</p>
              <FieldHint>Choose the company by name whenever it is available in the workspace.</FieldHint>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="product-id">Asset reference for update</Label>
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
                    label="Company"
                    value={productForm.organizationId}
                    onChange={(value) =>
                      setProductForm((previous) => ({
                        ...previous,
                        organizationId: value,
                      }))
                    }
                    options={organizationOptions}
                    placeholder="Select a company"
                  />
                ) : (
                  <div>
                    <Label htmlFor="product-organization-id">Company reference</Label>
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
                  <Label htmlFor="product-type">Product type</Label>
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
                  <Label htmlFor="product-brand">Brand</Label>
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
                  <Label htmlFor="product-model">Model</Label>
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
                  <Label htmlFor="product-asset-tag">Asset tag</Label>
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
                  Create product
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCreateProduct(true)}
                  disabled={Boolean(pendingByKey.products)}
                >
                  Create product (compatibility mode)
                </Button>
                <Button variant="secondary" onClick={handleUpdateProduct} disabled={Boolean(pendingByKey.products)}>
                  Update product
                </Button>
              </div>
            </div>
          ) : (
            <EmptyState
              title="Read-only asset view"
              description="Your role can review assigned assets here, but inventory changes stay with company leaders and admins."
            />
          )}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Read and delete</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {productOptions.length > 0 ? (
                <SelectField
                  id="product-lookup-id"
                  label="Asset"
                  value={productLookupId}
                  onChange={setProductLookupId}
                  options={productOptions}
                  placeholder="Select an asset"
                />
              ) : (
                <div>
                  <Label htmlFor="product-lookup-id">Asset reference</Label>
                  <Input
                    id="product-lookup-id"
                    type="number"
                    value={productLookupId}
                    onChange={(event) => setProductLookupId(event.target.value)}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="product-asset-search">Asset tag</Label>
                <Input
                  id="product-asset-search"
                  value={productAssetTag}
                  onChange={(event) => setProductAssetTag(event.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="product-type-query">Search by type</Label>
                <Input
                  id="product-type-query"
                  value={productTypeQuery}
                  onChange={(event) => setProductTypeQuery(event.target.value)}
                />
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleLookupProduct} disabled={Boolean(pendingByKey.products)}>
                Load details
              </Button>
              <Button
                variant="outline"
                onClick={handleSearchProductByAssetTag}
                disabled={Boolean(pendingByKey.products)}
              >
                Search asset tag
              </Button>
              <Button variant="outline" onClick={handleSearchProductByType} disabled={Boolean(pendingByKey.products)}>
                Search type
              </Button>
              {canManageProducts ? (
                <Button variant="danger" onClick={handleDeleteProduct} disabled={Boolean(pendingByKey.products)}>
                  Delete product
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-5">
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
                  Asset
                </span>
              </div>
              <dl className="mt-4 grid gap-3 text-sm text-slate-600">
                <div className="flex justify-between gap-4">
                  <dt>Asset tag</dt>
                  <dd className="font-semibold text-slate-900">{selectedProduct.assetTag}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Organization</dt>
                  <dd className="font-semibold text-slate-900">{getOrganizationName(selectedProduct.organizationId)}</dd>
                </div>
              </dl>
              <div className="mt-4">
                <Button variant="outline" onClick={() => populateProductForm(selectedProduct)}>
                  Edit in form
                </Button>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No selected product"
              description="Use the lookup or create actions to view a product here."
            />
          )}

          {productTypeResults.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Type search results</p>
              <div className="mt-4 grid gap-3">
                {productTypeResults.map((product) => (
                  <div key={product.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">
                      {product.productBrand} {product.productModel}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {product.productType} • {product.assetTag}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Company: {getOrganizationName(product.organizationId)}
                    </p>
                    <div className="mt-3">
                      <Button variant="outline" onClick={() => populateProductForm(product)}>
                        Use in form
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {products.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">{isEmployee ? "My visible assets" : "All products"}</p>
              <div className="mt-4 grid max-h-[30rem] gap-3 overflow-y-auto pr-1">
                {products.map((product) => (
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
                          Company: {getOrganizationName(product.organizationId)}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                        Asset
                      </span>
                    </div>
                    <div className="mt-3">
                      <Button variant="outline" onClick={() => populateProductForm(product)}>
                        Use in form
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              title="No products loaded"
              description="Create a product or reload the product list to populate this panel."
            />
          )}
        </div>
      </div>
    </SectionCard>
  );
}
