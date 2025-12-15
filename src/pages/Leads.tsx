import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeadsView from "../components/LeadsView";
import PipelinesView from "../components/PipelinesView";
import {
  mockEtapasFunil, 
  mockPipelines,
  EtapaFunil,
  Pipeline,
} from "@/lib/mockData";
import { AppLayout } from "@/components/layout/AppLayout";

export default function Leads() {
  const [pipelines, setPipelines] = useState<Pipeline[]>(mockPipelines);
  const [etapas, setEtapas] = useState<EtapaFunil[]>(mockEtapasFunil);

  return (
    <AppLayout>
      <div className="space-y-6 pt-4">
        <Tabs defaultValue="leads" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="mt-0">
            <LeadsView pipelines={pipelines} etapas={etapas} />
          </TabsContent>

          <TabsContent value="pipelines" className="mt-0">
            <PipelinesView
              pipelines={pipelines}
              onUpdatePipelines={setPipelines}
              etapas={etapas}
              onUpdateEtapas={setEtapas}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
