import { Card, CardContent } from "@/components/ui/card";
import { IconMail, IconMessage2, IconPhone } from "@tabler/icons-react";

export function ContactInfoCards() {
  return (
    <div className="mt-8 grid md:grid-cols-3 gap-6">
      <Card>
        <CardContent className="p-6 text-center">
          <IconMail className="w-8 h-8 mx-auto mb-3 text-primary" />
          <h3 className="font-semibold mb-2">Email</h3>
          <p className="text-sm text-muted-foreground">ccdjewelry@gmail.com</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 text-center">
          <IconPhone className="w-8 h-8 mx-auto mb-3 text-primary" />
          <h3 className="font-semibold mb-2">Phone</h3>
          <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 text-center">
          <IconMessage2 className="w-8 h-8 mx-auto mb-3 text-primary" />
          <h3 className="font-semibold mb-2">Telegram</h3>
          <p className="text-sm text-muted-foreground">@CCDJewelry</p>
        </CardContent>
      </Card>
    </div>
  );
}
