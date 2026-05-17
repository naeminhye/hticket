"use client";
import { useEffect } from "react";
import { useCustomerStore } from "@/store/customerStore";
import { DEMO_EVENTS, STARLIGHT_AREAS, getEventById, getAreasForEvent } from "@/lib/data";
import { useEventStore, toCustomerEvent, toAreas } from "@/store/eventStore";

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
  const { events: storeEvents, rehydrate } = useEventStore();

  useEffect(() => { rehydrate(); }, []);

  // Sync event from params — check store first, then demo data
  useEffect(() => {
    if (!params.eventId) return;
    const stored = storeEvents.find(e => e.id === params.eventId);
    if (stored) {
      setCurrentEvent(toCustomerEvent(stored));
    } else {
      const ev = getEventById(params.eventId);
      if (ev) setCurrentEvent(ev);
    }
  }, [params.eventId, storeEvents]);

  // Sync area from params
  useEffect(() => {
    if (!params.areaId) return;
    const stored = storeEvents.find(e => e.id === params.eventId);
    const areas = stored ? toAreas(stored) : getAreasForEvent(params.eventId || "");
    const area = areas.find(a => a.id === params.areaId);
    if (area) setCurrentArea(area);
  }, [params.areaId, params.eventId, storeEvents]);

  const event = currentEvent || DEMO_EVENTS[0];

  // Use zones from store for custom events, STARLIGHT_AREAS for demo events
  const storedEvent = storeEvents.find(e => e.id === event.id);
  const areas = storedEvent ? toAreas(storedEvent) : STARLIGHT_AREAS;
  const area = currentArea || areas[0];

  const allEvents = [...storeEvents.map(toCustomerEvent), ...DEMO_EVENTS];

  switch (screen) {
    case "home":
      return <HomeScreen go={go} events={allEvents} />;
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
      return <HomeScreen go={go} events={allEvents} />;
  }
}
