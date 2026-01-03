// e-commerce/frontend/lib/api.ts 
export async function fetchMe(accessToken: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/me`, // ⬅️ GANTI
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Unauthorized");
  }

  return res.json();
}

export async function fetchSupplierMe(accessToken: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/supplier/me`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Unauthorized");
  }

  return res.json();
}

