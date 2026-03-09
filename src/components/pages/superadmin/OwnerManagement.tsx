import StoreOwnerMainComp from '@/components/features/superadmin/store_owner/StoreOwnerMainComp';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'react-router';

const OwnerManagement = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('active_tab') || 'store_owners';
  return (
    <div>
      <Tabs defaultValue={activeTab}>
        <div className="item flex-center justify-between">
          <TabsList>
            <TabsTrigger value="store_owners">All Owners</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="store_owners">
          <StoreOwnerMainComp />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OwnerManagement;
