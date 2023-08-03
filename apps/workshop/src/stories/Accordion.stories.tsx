import React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "ui";

type Story = StoryObj<typeof Accordion>;

const meta = {
  component: Accordion,
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Accordion>;

const Playground: Story = {
  args: {
    children: (
      <>
        <AccordionItem value="kyc-b">
          <AccordionTrigger>KYC/B</AccordionTrigger>
          <AccordionContent>
            Privacy protective, reusable KYC/B. Prove you&apos;re a real person
            or business without disclosing your identity data to anyone else.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sanctions">
          <AccordionTrigger>Sanctions</AccordionTrigger>
          <AccordionContent>
            Continuous & routine sanctions checks against major sanctions lists
            (US, UK, UN, EU). Demonstrate you&apos;re not a sanction risk across
            all of Web3.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="kyt">
          <AccordionTrigger>KYT</AccordionTrigger>
          <AccordionContent>
            Comprehensive & ongoing blockchain analytics screening against
            sanctions lists & for illicit activity. Show that you&apos;re a safe
            counterparty while maintaining on-chain anonymity.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="geofencing">
          <AccordionTrigger>Geofencing</AccordionTrigger>
          <AccordionContent>
            Confirm physical location at registration & at the time of
            transaction. Prove you comply with terms of service (e.g., no US
            users) & haven&apos;t moved to a geographically sanctioned region.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="2fa">
          <AccordionTrigger>2FA</AccordionTrigger>
          <AccordionContent>
            Account security & confidence in identity continuity. Ensure your
            account & data are protected from bad actors while increasing
            on-chain confidence that you&apos;re you.
          </AccordionContent>
        </AccordionItem>
      </>
    ),
    type: "single",
    collapsible: true,
    defaultValue: "kyc-b",
  },
};

export { Playground };

export default meta;
