// e-commerce/frontend/lib/api/supplier.ts
export async function fetchSupplierStats(token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/supplier/stats`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}
