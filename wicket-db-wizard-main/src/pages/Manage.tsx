import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamForm } from "@/components/manage/TeamForm";
import { PlayerForm } from "@/components/manage/PlayerForm";
import { MatchForm } from "@/components/manage/MatchForm";
import { PerformanceForm } from "@/components/manage/PerformanceForm";
import { AwardForm } from "@/components/manage/AwardForm";

export default function Manage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Data</h1>
          <p className="text-muted-foreground mt-2">
            Create, update, and delete cricket data with live SQL execution display
          </p>
        </div>

        <Tabs defaultValue="teams" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="awards">Awards</TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="space-y-4">
            <TeamForm />
          </TabsContent>

          <TabsContent value="players" className="space-y-4">
            <PlayerForm />
          </TabsContent>

          <TabsContent value="matches" className="space-y-4">
            <MatchForm />
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <PerformanceForm />
          </TabsContent>

          <TabsContent value="awards" className="space-y-4">
            <AwardForm />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
