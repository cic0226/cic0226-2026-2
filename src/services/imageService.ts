import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { LIMITES, validarFoto } from '@/utils/validation';

/** Opens the system photo picker, crops a square and returns a compact JPEG data URI. */
export async function selecionarFotoBase64(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted)
    throw new Error('Permita o acesso às fotos nas configurações do aparelho.');
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
    allowsMultipleSelection: false,
  });
  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  if (!asset.width || !asset.height)
    throw new Error('Não foi possível ler as dimensões da imagem.');
  const side = Math.min(asset.width, asset.height);
  const attempts = [
    { size: 320, quality: 0.78 },
    { size: 256, quality: 0.65 },
    { size: 192, quality: 0.5 },
  ];
  for (const attempt of attempts) {
    const context = ImageManipulator.manipulate(asset.uri);
    context.crop({
      originX: Math.floor((asset.width - side) / 2),
      originY: Math.floor((asset.height - side) / 2),
      width: side,
      height: side,
    });
    context.resize({ width: attempt.size, height: attempt.size });
    const rendered = await context.renderAsync();
    const image = await rendered.saveAsync({
      format: SaveFormat.JPEG,
      compress: attempt.quality,
      base64: true,
    });
    if (!image.base64) throw new Error('Não foi possível converter a foto.');
    const uri = `data:image/jpeg;base64,${image.base64}`;
    if (uri.length <= LIMITES.fotoBase64) return validarFoto(uri);
  }
  throw new Error('A foto ficou muito grande. Selecione uma imagem mais simples.');
}
