import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FileUploadProps {
  onDataProcessed: (stats: any) => void;
  currentType: string;
}

const FileUpload = ({ onDataProcessed, currentType }: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    toast.info('Processing file...');

    try {
      if (file.name.endsWith('.csv')) {
        Papa.parse(file, {
          header: true,
          complete: async (results) => {
            try {
              const { data, error } = await supabase.functions.invoke('process-mining-data', {
                body: { data: results.data, type: currentType },
              });

              if (error) throw error;

              toast.success('Data uploaded successfully!');
              onDataProcessed(data.stats);
            } catch (error: any) {
              toast.error('Failed to process data: ' + error.message);
            } finally {
              setIsUploading(false);
            }
          },
          error: (error) => {
            toast.error('Failed to parse CSV: ' + error.message);
            setIsUploading(false);
          },
        });
      } else if (file.name.endsWith('.json') || file.name.endsWith('.geojson')) {
        const text = await file.text();
        const jsonData = JSON.parse(text);
        
        const features = jsonData.features || jsonData;
        const parsedData = features.map((f: any) => {
          if (f.geometry) {
            return {
              latitude: f.geometry.coordinates[1],
              longitude: f.geometry.coordinates[0],
              value: f.properties?.value || Math.random() * 100,
              type: f.properties?.type || currentType,
            };
          }
          return f;
        });

        const { data, error } = await supabase.functions.invoke('process-mining-data', {
          body: { data: parsedData, type: currentType },
        });

        if (error) throw error;

        toast.success('Data uploaded successfully!');
        onDataProcessed(data.stats);
        setIsUploading(false);
      } else {
        toast.error('Unsupported file format. Please upload CSV or GeoJSON.');
        setIsUploading(false);
      }
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message);
      setIsUploading(false);
    }

    // Reset input
    event.target.value = '';
  };

  return (
    <div className="relative">
      <input
        type="file"
        accept=".csv,.json,.geojson"
        onChange={handleFileUpload}
        disabled={isUploading}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload">
        <Button
          disabled={isUploading}
          className="cursor-pointer"
          asChild
        >
          <span>
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Upload Dataset
          </span>
        </Button>
      </label>
    </div>
  );
};

export default FileUpload;
