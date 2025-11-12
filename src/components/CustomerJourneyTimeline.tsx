import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  User,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  MessageSquare,
  Zap,
  Target,
  Star,
  Award,
  DollarSign,
} from "lucide-react";

interface CustomerJourneyTimelineProps {
  journey: {
    clientName: string;
    clientEmail?: string;
    mrr: number;
    customerSince: number;
    events: Array<{
      date: number;
      type: "feedback" | "iteration" | "validation" | "signup";
      data: any;
      satisfaction?: number;
    }>;
    trend: number;
    firstSatisfaction: number;
    lastSatisfaction: number;
    totalFeedback: number;
    totalIterations: number;
    status: "happy" | "neutral" | "at_risk";
  };
  onClose: () => void;
}

export default function CustomerJourneyTimeline({ journey, onClose }: CustomerJourneyTimelineProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case "signup":
        return <User className="h-4 w-4" />;
      case "feedback":
        return <MessageSquare className="h-4 w-4" />;
      case "iteration":
        return <Zap className="h-4 w-4" />;
      case "validation":
        return <Target className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string, satisfaction?: number) => {
    if (type === "signup") return "bg-blue-500";
    if (type === "iteration") return "bg-purple-500";
    if (type === "validation") return "bg-green-500";
    
    // Feedback color based on satisfaction
    if (satisfaction === undefined) return "bg-gray-500";
    if (satisfaction >= 8) return "bg-green-500";
    if (satisfaction >= 5) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "happy":
        return <Badge className="bg-green-600 text-white">✅ Happy Customer</Badge>;
      case "neutral":
        return <Badge className="bg-yellow-600 text-white">😐 Neutral</Badge>;
      case "at_risk":
        return <Badge className="bg-red-600 text-white">⚠️ At Risk</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="shadow-2xl border-2 border-purple-200 dark:border-purple-800">
        <CardHeader className="bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950 dark:via-pink-950 dark:to-orange-950">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-2 rounded-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{journey.clientName}</h3>
                  {journey.clientEmail && (
                    <p className="text-sm text-muted-foreground font-normal">{journey.clientEmail}</p>
                  )}
                </div>
              </CardTitle>
              
              <div className="flex items-center gap-4 mt-3">
                {journey.mrr > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold">${journey.mrr.toLocaleString()}</span>
                    <span className="text-muted-foreground">at risk</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-muted-foreground">Since</span>
                  <span className="font-semibold">{new Date(journey.customerSince).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                </div>
                {getStatusBadge(journey.status)}
              </div>
            </div>
            
            <Button variant="outline" onClick={onClose} className="cursor-pointer">
              Close
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Trend Summary */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Satisfaction Trend</p>
                <div className="flex items-center gap-2">
                  {journey.trend > 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : journey.trend < 0 ? (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  ) : (
                    <Minus className="h-5 w-5 text-gray-600" />
                  )}
                  <span className={`text-2xl font-bold ${
                    journey.trend > 0 ? "text-green-600" : journey.trend < 0 ? "text-red-600" : "text-gray-600"
                  }`}>
                    {journey.trend > 0 ? "+" : ""}{journey.trend} points
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({journey.firstSatisfaction}/10 → {journey.lastSatisfaction}/10)
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Activity</p>
                <p className="text-lg font-semibold">
                  {journey.totalFeedback} feedback • {journey.totalIterations} iterations
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-300 via-pink-300 to-orange-300 dark:from-purple-700 dark:via-pink-700 dark:to-orange-700" />

            {/* Events */}
            <div className="space-y-6">
              {journey.events.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative pl-16"
                >
                  {/* Icon */}
                  <div className={`absolute left-3 w-6 h-6 rounded-full ${getEventColor(event.type, event.satisfaction)} flex items-center justify-center text-white shadow-lg`}>
                    {getEventIcon(event.type)}
                  </div>

                  {/* Date */}
                  <div className="absolute left-0 -top-1 text-xs font-semibold text-muted-foreground w-12 text-right pr-2">
                    {formatDate(event.date)}
                  </div>

                  {/* Content */}
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md border-2 border-gray-200 dark:border-gray-800">
                    {event.type === "signup" && (
                      <div>
                        <p className="font-semibold text-blue-600 dark:text-blue-400">🟢 Signed up</p>
                        <p className="text-sm text-muted-foreground">Customer journey begins</p>
                      </div>
                    )}

                    {event.type === "feedback" && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {event.data.satisfactionScore >= 8 ? (
                            <p className="font-semibold text-green-600 dark:text-green-400">😊 Feedback</p>
                          ) : event.data.satisfactionScore >= 5 ? (
                            <p className="font-semibold text-yellow-600 dark:text-yellow-400">😐 Feedback</p>
                          ) : (
                            <p className="font-semibold text-red-600 dark:text-red-400">😞 Feedback</p>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {event.data.satisfactionScore}/10
                          </Badge>
                        </div>
                        <p className="text-sm">"{event.data.feedbackText}"</p>
                        {event.data.feedbackType === "testimonial" && (
                          <Badge className="mt-2 bg-yellow-500 text-white">⭐ Testimonial</Badge>
                        )}
                      </div>
                    )}

                    {event.type === "iteration" && (
                      <div>
                        <p className="font-semibold text-purple-600 dark:text-purple-400">🔧 Iteration: {event.data.title}</p>
                        <p className="text-sm text-muted-foreground">{event.data.description}</p>
                        <Badge variant="outline" className="mt-2 text-xs">
                          v{event.data.iterationNumber}
                        </Badge>
                      </div>
                    )}

                    {event.type === "validation" && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-green-600 dark:text-green-400">😃 Validation</p>
                          <Badge variant="outline" className="text-xs">
                            {event.data.postSatisfaction}/10
                          </Badge>
                        </div>
                        <p className="text-sm">
                          {event.data.problemSolved === "yes_confirmed" ? "✅ Confirmed fixed" : "⏳ Testing in progress"}
                        </p>
                        {event.data.customerQuote && (
                          <p className="text-sm italic mt-2 text-muted-foreground">"{event.data.customerQuote}"</p>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          {journey.status === "happy" && journey.lastSatisfaction >= 8 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-xl border-2 border-green-200 dark:border-green-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Ready for Case Study
                  </p>
                  <p className="text-sm text-muted-foreground">This customer has a great success story!</p>
                </div>
                <Button className="cursor-pointer bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  Request Testimonial
                </Button>
              </div>
            </motion.div>
          )}

          {journey.status === "at_risk" && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 rounded-xl border-2 border-red-200 dark:border-red-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
                    ⚠️ Action Required
                  </p>
                  <p className="text-sm text-muted-foreground">Customer satisfaction is low - reach out immediately</p>
                </div>
                <Button className="cursor-pointer bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
                  Create Iteration
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
