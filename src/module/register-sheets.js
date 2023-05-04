import ItemSheetMc3e from './item/sheet';

export default function registerSheets() {
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('mc3e', ItemSheetMc3e, {makeDefault: true});
}
