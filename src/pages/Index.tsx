import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import HeatMap from '@/components/HeatMap';
import StatCard from '@/components/StatCard';
import FileUpload from '@/components/FileUpload';
import { 
  TrendingUp, 
  AlertTriangle, 
  MapPin, 
  Home,
  Download,
  Database,
  Activity,
  Radiation,
  Wind
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MiningData {
  latitude: number;
  longitude: number;
  value: number;
  type: string;
}

interface Stats {
  max: number;
  average: number;
  dangerZoneCount: number;
  habitationDistance: number;
}

const Index = () => {
  const [selectedType, setSelectedType] = useState<'gas' | 'radiation' | 'vibration'>('gas');
  const [data, setData] = useState<MiningData[]>([]);
  const [stats, setStats] = useState<Stats>({
    max: 0,
    average: 0,
    dangerZoneCount: 0,
    habitationDistance: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async (type: string) => {
    setIsLoading(true);
    try {
      const { data: miningData, error } = await supabase
        .from('mining_data')
        .select('*')
        .eq('type', type);

      if (error) throw error;

      if (miningData && miningData.length > 0) {
        const typedData = miningData.map(d => ({
          latitude: typeof d.latitude === 'string' ? parseFloat(d.latitude) : d.latitude,
          longitude: typeof d.longitude === 'string' ? parseFloat(d.longitude) : d.longitude,
          value: typeof d.value === 'string' ? parseFloat(d.value) : d.value,
          type: d.type,
        }));
        
        setData(typedData);
        calculateStats(typedData);
      } else {
        setData([]);
        setStats({ max: 0, average: 0, dangerZoneCount: 0, habitationDistance: 0 });
      }
    } catch (error: any) {
      toast.error('Failed to fetch data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data: MiningData[]) => {
    if (data.length === 0) {
      setStats({ max: 0, average: 0, dangerZoneCount: 0, habitationDistance: 0 });
      return;
    }

    const values = data.map(d => d.value);
    const max = Math.max(...values);
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const dangerZoneCount = values.filter(v => v > 40).length;
    const habitationDistance = Math.round((max / 10) * 100) / 100;

    setStats({ max, average, dangerZoneCount, habitationDistance });
  };

  const loadSampleData = async () => {
    setIsLoading(true);
    toast.info('Loading sample data...');
    
    try {
      const { data: sampleData, error } = await supabase.functions.invoke('get-sample-data');

      if (error) throw error;

      const { data: processedData, error: processError } = await supabase.functions.invoke('process-mining-data', {
        body: { data: sampleData.data, type: selectedType },
      });

      if (processError) throw processError;

      toast.success('Sample data loaded!');
      await fetchData(selectedType);
    } catch (error: any) {
      toast.error('Failed to load sample data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDFReport = async () => {
    try {
      const { data: reportData, error } = await supabase.functions.invoke('generate-report', {
        body: { type: selectedType, stats },
      });

      if (error) throw error;

      // Create a blob and download
      const blob = new Blob([reportData.htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mine-safety-report-${selectedType}-${Date.now()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Report downloaded successfully!');
    } catch (error: any) {
      toast.error('Failed to generate report: ' + error.message);
    }
  };

  const exportHeatmapImage = () => {
    toast.info('Use browser screenshot tools to capture the heatmap');
  };

  const clearData = async () => {
    try {
      const { error } = await supabase
        .from('mining_data')
        .delete()
        .eq('type', selectedType);

      if (error) throw error;

      toast.success('Data cleared successfully!');
      setData([]);
      setStats({ max: 0, average: 0, dangerZoneCount: 0, habitationDistance: 0 });
    } catch (error: any) {
      toast.error('Failed to clear data: ' + error.message);
    }
  };

  useEffect(() => {
    fetchData(selectedType);
  }, [selectedType]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'gas':
        return Wind;
      case 'radiation':
        return Radiation;
      case 'vibration':
        return Activity;
      default:
        return Wind;
    }
  };

  const TypeIcon = getTypeIcon(selectedType);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Mine Safety HeatMap Analyzer
          </h1>
          <p className="text-muted-foreground text-lg">
            Visualize dangerous mining zones using real-time heatmaps
          </p>
        </div>

        {/* Controls */}
        <Card className="p-4 md:p-6 border-2 border-border">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedType === 'gas' ? 'default' : 'outline'}
                onClick={() => setSelectedType('gas')}
                className="gap-2"
              >
                <Wind className="h-4 w-4" />
                Toxic Gas (SO₂, CH₄, CO)
              </Button>
              <Button
                variant={selectedType === 'radiation' ? 'default' : 'outline'}
                onClick={() => setSelectedType('radiation')}
                className="gap-2"
              >
                <Radiation className="h-4 w-4" />
                Radiation Levels
              </Button>
              <Button
                variant={selectedType === 'vibration' ? 'default' : 'outline'}
                onClick={() => setSelectedType('vibration')}
                className="gap-2"
              >
                <Activity className="h-4 w-4" />
                Seismic Activity
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <FileUpload
                onDataProcessed={(newStats) => {
                  setStats(newStats);
                  fetchData(selectedType);
                }}
                currentType={selectedType}
              />
              <Button variant="secondary" onClick={loadSampleData} disabled={isLoading}>
                <Database className="mr-2 h-4 w-4" />
                Load Sample
              </Button>
              <Button variant="outline" onClick={clearData}>
                Clear Data
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Maximum Value"
            value={stats.max.toFixed(2)}
            icon={TrendingUp}
            variant="danger"
          />
          <StatCard
            title="Average Value"
            value={stats.average.toFixed(2)}
            icon={TypeIcon}
            variant="warning"
          />
          <StatCard
            title="Danger Zone Count"
            value={stats.dangerZoneCount}
            icon={AlertTriangle}
            variant="danger"
          />
          <StatCard
            title="Safe Distance (km)"
            value={stats.habitationDistance.toFixed(2)}
            icon={Home}
            variant="safe"
          />
        </div>

        {/* Map */}
        <Card className="p-4 md:p-6 border-2 border-border">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <MapPin className="h-6 w-6 text-primary" />
                Interactive HeatMap - {selectedType.toUpperCase()}
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportHeatmapImage}>
                  <Download className="mr-2 h-4 w-4" />
                  PNG
                </Button>
                <Button variant="outline" size="sm" onClick={generatePDFReport}>
                  <Download className="mr-2 h-4 w-4" />
                  PDF Report
                </Button>
              </div>
            </div>
            <div className="h-[500px] w-full">
              <HeatMap data={data} type={selectedType} />
            </div>
          </div>
        </Card>

        {/* Legend */}
        <Card className="p-4 border-2 border-border">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Safety Level Legend</h3>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-safe"></div>
              <span className="text-sm text-muted-foreground">Safe (&lt; 40)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-warning"></div>
              <span className="text-sm text-muted-foreground">Moderate (40-80)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-danger"></div>
              <span className="text-sm text-muted-foreground">Severe (&gt; 80)</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
