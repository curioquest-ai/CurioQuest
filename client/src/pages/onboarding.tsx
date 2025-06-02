import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { insertUserSchema } from "@shared/schema";

const grades = [
  { value: "6", label: "Grade 6" },
  { value: "7", label: "Grade 7" },
  { value: "8", label: "Grade 8" },
  { value: "9", label: "Grade 9" },
  { value: "10", label: "Grade 10" },
  { value: "11", label: "Grade 11" },
  { value: "12", label: "Grade 12" },
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { setUser } = useAuth();

  const form = useForm({
    resolver: zodResolver(insertUserSchema.extend({
      grade: insertUserSchema.shape.grade.transform(val => parseInt(val.toString()))
    })),
    defaultValues: {
      name: "",
      grade: "" as any,
      school: "",
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: { name: string; grade: number; school: string }) => {
      const response = await apiRequest("POST", "/api/users", userData);
      return response.json();
    },
    onSuccess: (user) => {
      setUser(user);
      toast({
        title: "Welcome to CurioQuest!",
        description: "Your learning adventure begins now!",
      });
      setLocation("/feed");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create your account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    createUserMutation.mutate({
      ...data,
      grade: parseInt(data.grade),
    });
  };

  return (
    <div className="h-screen w-full gradient-primary flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-3xl"></div>
      
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 relative z-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg"
        >
          <GraduationCap className="w-10 h-10 text-accent-foreground" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-4xl font-bold mb-2 text-white"
        >
          CurioQuest
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-lg text-white/90"
        >
          Learn through adventure!
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="w-full max-w-sm relative z-10"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Your Name"
                      className="glass text-white placeholder:text-white/70 border-white/30 focus:border-accent bg-white/10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-200" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger className="glass text-white border-white/30 focus:border-accent bg-white/10">
                        <SelectValue placeholder="Select Grade" className="text-white/70" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border">
                      {grades.map((grade) => (
                        <SelectItem key={grade.value} value={grade.value}>
                          {grade.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-200" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="school"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="School Name"
                      className="glass text-white placeholder:text-white/70 border-white/30 focus:border-accent bg-white/10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-200" />
                </FormItem>
              )}
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="pt-2"
            >
              <Button
                type="submit"
                disabled={createUserMutation.isPending}
                className="w-full bg-accent text-accent-foreground font-semibold py-3 hover:bg-accent/90 transition-colors shadow-lg"
              >
                {createUserMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-foreground"></div>
                    <span>Starting Quest...</span>
                  </div>
                ) : (
                  "Start My Quest!"
                )}
              </Button>
            </motion.div>
          </form>
        </Form>
      </motion.div>

      {/* Decorative elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ delay: 1, duration: 2 }}
        className="absolute top-10 left-10 w-32 h-32 bg-accent rounded-full blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ delay: 1.5, duration: 2 }}
        className="absolute bottom-20 right-10 w-24 h-24 bg-secondary rounded-full blur-2xl"
      />
    </div>
  );
}
