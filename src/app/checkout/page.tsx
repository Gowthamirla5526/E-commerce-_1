import React from "react";
import { prisma } from "@/core/db/prisma";
import { getCustomerSession } from "@/core/security/customer-auth";
import { CheckoutClient } from "@/shared/components/checkout/CheckoutClient";

export const revalidate = 0; // Fresh checkout data

export default async function CheckoutPage() {
  const session = await getCustomerSession();
  const userId = session?.userId || (await prisma.user.findFirst({ where: { role: "CUSTOMER" } }))?.id;

  const addresses = userId
    ? await prisma.address.findMany({
        where: { userId },
        orderBy: { isDefault: "desc" },
      })
    : [];

  const serialized = addresses.map((a) => ({
    id: a.id,
    label: a.label,
    recipientName: a.recipientName,
    phone: a.phone,
    streetLine1: a.streetLine1,
    locality: a.locality,
    city: a.city,
    state: a.state,
    pincode: a.pincode,
    isDefault: a.isDefault,
  }));

  return <CheckoutClient initialAddresses={serialized} />;
}

