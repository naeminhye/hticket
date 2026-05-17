"use client";
import { useEffect } from "react";
import { useCustomerStore } from "@/store/customerStore";
import { DEMO_EVENTS, STARLIGHT_AREAS, getEventById, getAreasForEvent } from "@/lib/data";

import HomeScreen from "./screens/HomeScreen";
import EventScreen from "./screens/EventScreen";
import AreaScreen from "./screens/AreaScreen";
import SeatMapScreen from "./screens/SeatMapScreen";
import QuantityScreen from "./screens/QuantityScreen";
import CheckoutScreen from "./screens/CheckoutScreen";
import PaymentScreen from "./screens/PaymentScreen";
import TicketScreen from "./screens/TicketScreen";

export default function CustomerApp() {
  const { screen, params, currentEvent, currentArea, go, setCurrentEvent, setCurrentArea } = useCustomerStore();

  // Sync event/area from params
  useEffect(() => {
    if (params.eventId) {
      const event = getEventById(params.eventId);
      if (event) setCurrentEvent(event);
    }
  }, [params.eventId]);

  useEffect(() => {
    if (params.areaId) {
      const areas = getAreasForEvent(params.eventId || "");
      const area = areas.find(a => a.id === params.areaId);
      if (area) setCurrentArea(area);
    }
  }, [params.areaId]);

  const event = currentEvent || DEMO_EVENTS[0];
  const areas = STARLIGHT_AREAS;
  const area = currentArea || areas[0];

  switch (screen) {
    case "home":
      return <HomeScreen go={go} events={DEMO_EVENTS} />;
    case "event":
      return <EventScreen go={go} event={event} areas={areas} />;
    case "areas":
      return <AreaScreen go={go} event={event} areas={areas} />;
    case "seats":
      return <SeatMapScreen go={go} event={event} area={area} />;
    case "quantity":
      return <QuantityScreen go={go} event={event} area={area} />;
    case "checkout":
      return <CheckoutScreen go={go} event={event} area={area} items={params.items || []} />;
    case "payment":
      return <PaymentScreen go={go} event={event} area={area} items={params.items || []} />;
    case "ticket":
      return <TicketScreen go={go} event={event} area={area} items={params.items || []} />;
    default:
      return <HomeScreen go={go} events={DEMO_EVENTS} />;
  }
}
