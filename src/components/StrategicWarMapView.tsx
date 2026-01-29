import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Target, Shield, AlertTriangle, Crosshair, Calendar } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, getDay } from "date-fns";
import { toast } from "sonner";

interface StrategicWarMapViewProps {
  year: number;
}

export default function StrategicWarMapView() { return null; }