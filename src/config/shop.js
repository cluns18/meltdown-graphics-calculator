// shop_id must match a brand-kit file in obg-mail-api/shops/<id>.json. That registry
// owns the email styling and recipients.
const SHOP_CONFIG = {
    shop_id: 'meltdown',
    shop_name: 'Meltdown Graphics',
    shop_email: 'meltdowngraphics@gmail.com',
    shop_owner_email: 'jake@meltdowngraphics.com',
    shop_phone: '865-621-8837',
    // Jake's 2026-09-18 revisions took the street address off everything customer
    // facing. City only.
    shop_address: 'Knoxville, TN',
    owner_name: 'Jake',
    // The Gang Sheet Builder product on the store, for transfers bought by the sheet.
    gang_sheet_url: '/products/dtf-gang-sheet-builder',
    // Brand kit from the client's own guidelines PDF (Jake, 2026-09-01). The PDF says
    // do not change the colors even if they look similar.
    ink: '#191819',
    paper: '#e2e7e6',
    teal: '#275160',
    teal_lift: '#5fa3b8',   // teal on ink is 2.05:1, this is 6.25:1
    gold: '#d7a15a',        // button fill only
    theme: 'dark',
};

export default SHOP_CONFIG;
