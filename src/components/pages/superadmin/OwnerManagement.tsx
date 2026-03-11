import StoreOwnerMainComp from '@/components/features/superadmin/store_owner/StoreOwnerMainComp';
// import SubscriptionBillingMainComp from '@/components/features/superadmin/subscription_and_billing/SubscriptionBillingMainComp';
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
        {/* <TabsContent value="subscriptions">
          <SubscriptionBillingMainComp />
        </TabsContent> */}
      </Tabs>
    </div>
  );
};

export default OwnerManagement;
