import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { TopBar } from '@/components/ui/TopBar';
import { UploadSheet } from '@/components/ui/UploadSheet';
import { useMe } from '@/src/api/account/hooks';
import { useVendor } from '@/src/api/vendors/hooks';
import { vendorsApi } from '@/src/api/vendors';
import { useImagePicker, type PickedImage } from '@/src/hooks/useImagePicker';
import { useToast } from '@/src/hooks/use-toast';
import { continuous, corner, type, useUi } from '@/src/theme/ui';
import { assetUploadErrorMessage, uploadLocalAsset } from '@/src/utils/upload-media';
import { apiErrorMessage } from '@/src/utils/api-error-message';

type Slot = 'logo' | 'banner' | null;

export default function StoreDetailsScreen() {
  const ui = useUi();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: me } = useMe();
  const handle = me?.handle;
  const { data: vendor, isLoading: vendorLoading } = useVendor(handle);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [logo, setLogo] = useState<PickedImage | null>(null);
  const [banner, setBanner] = useState<PickedImage | null>(null);
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null);
  const [existingBannerUrl, setExistingBannerUrl] = useState<string | null>(null);
  const [showOnMap, setShowOnMap] = useState(true);
  const [maskLocation, setMaskLocation] = useState(false);
  const [activeSlot, setActiveSlot] = useState<Slot>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { pick } = useImagePicker();

  // Prepopulate from existing vendor profile
  useEffect(() => {
    if (vendor) {
      if (vendor.storeName && !name) setName(vendor.storeName);
      if (vendor.about && !bio) setBio(vendor.about);
      if (vendor.photos?.[0]) setExistingBannerUrl(vendor.photos[0]);
      if (vendor.photos?.[1]) setExistingLogoUrl(vendor.photos[1]);
      setShowOnMap(vendor.showOnMap ?? true);
      setMaskLocation(vendor.showExactLocation === false);
    } else if (me && !name) {
      setName(me.name || me.handle || '');
    }
  }, [vendor, me]);

  const handlePick = async (source: 'camera' | 'library') => {
    const slot = activeSlot;
    setActiveSlot(null);
    if (!slot) return;
    const img = await pick(source);
    if (!img) return;
    if (slot === 'logo') setLogo(img);
    else setBanner(img);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Store name required', { description: 'Please enter a name for your store.' });
      return;
    }

    setIsSaving(true);
    let logoMediaId: string | undefined;
    let bannerMediaId: string | undefined;

    try {
      if (logo) {
        const uploadedLogo = await uploadLocalAsset(logo, 'product');
        logoMediaId = uploadedLogo.mediaId;
      }
      if (banner) {
        const uploadedBanner = await uploadLocalAsset(banner, 'product');
        bannerMediaId = uploadedBanner.mediaId;
      }
    } catch (err) {
      setIsSaving(false);
      toast.error('Media upload failed', {
        description: assetUploadErrorMessage(err),
      });
      return;
    }

    try {
      await vendorsApi.setupStore({
        offerType: 'physical',
        category: vendor?.category || 'General',
        storeName: name.trim(),
        description: bio.trim() || undefined,
        logoMediaId,
        bannerMediaId,
      });
      await vendorsApi.updateLocationSettings({
        showOnMap,
        showExactLocation: !maskLocation,
      });

      await queryClient.invalidateQueries({ queryKey: ['vendor', handle] });
      await queryClient.invalidateQueries({ queryKey: ['me'] });

      toast.success('Storefront updated!', {
        description: 'Your banner and store details are now live.',
        icon: 'checkmark-circle',
      });
      router.back();
    } catch (err) {
      toast.error('Could not save store details', {
        description: apiErrorMessage(err),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer variant="espresso">
      <TopBar
        title="Edit Storefront"
        showBack
        rightAction={
          <Pressable
            disabled={isSaving || !name.trim()}
            onPress={handleSave}
            hitSlop={8}
            style={({ pressed }) => [{ opacity: isSaving || !name.trim() ? 0.4 : pressed ? 0.8 : 1 }]}>
            {isSaving ? (
              <ActivityIndicator size="small" color={ui.accent} />
            ) : (
              <Text style={{ color: ui.accent, fontWeight: '700', fontSize: 16 }}>Save</Text>
            )}
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={[type.title2, { color: ui.label, textAlign: 'center', marginTop: 12 }]}>
          Store Banner & Profile
        </Text>
        <Text style={[type.subhead, { color: ui.secondaryLabel, textAlign: 'center', marginTop: 4, marginBottom: 20 }]}>
          Customize your storefront header image, logo, and merchant description.
        </Text>

        <View style={styles.form}>
          {/* Store Banner Hero Card */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[type.subhead, { color: ui.label, fontWeight: '700' }]}>Store Header Banner</Text>
              <Text style={[type.caption2, { color: ui.secondaryLabel }]}>Recommended: 16:9 Landscape</Text>
            </View>
            <BannerDropzone
              image={banner}
              existingUrl={existingBannerUrl}
              onPress={() => setActiveSlot('banner')}
              ui={ui}
            />
          </View>

          {/* Store Logo Card */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[type.subhead, { color: ui.label, fontWeight: '700' }]}>Store Logo / Avatar</Text>
              <Text style={[type.caption2, { color: ui.secondaryLabel }]}>Square 1:1</Text>
            </View>
            <LogoDropzone
              image={logo}
              existingUrl={existingLogoUrl}
              onPress={() => setActiveSlot('logo')}
              ui={ui}
            />
          </View>

          {/* Details Form */}
          <View style={styles.sectionBlock}>
            <Text style={[type.subhead, { color: ui.label, fontWeight: '700', marginBottom: 8 }]}>Store Information</Text>
            <TextField placeholder="Store Name" value={name} onChangeText={setName} />
            <TextField
              placeholder="Store Bio / What you sell"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              style={styles.bioInput}
            />
          </View>

          {/* Location settings */}
          <View style={[styles.sectionBlock, continuous, { borderRadius: corner.lg, backgroundColor: ui.card, padding: 16 }]}>
            <Text style={[type.subhead, { color: ui.label, fontWeight: '700', marginBottom: 12 }]}>Discovery & Privacy</Text>
            
            <View style={styles.toggleRow}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[type.subhead, { color: ui.label, fontWeight: '600' }]}>Feature store on proximity map</Text>
                <Text style={[type.caption, { color: ui.secondaryLabel }]}>
                  Allow nearby shoppers to find your items on the local map.
                </Text>
              </View>
              <Switch
                value={showOnMap}
                onValueChange={setShowOnMap}
                trackColor={{ false: 'rgba(255,255,255,0.2)', true: ui.accent }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[styles.divider, { backgroundColor: ui.separator }]} />

            <View style={styles.toggleRow}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[type.subhead, { color: ui.label, fontWeight: '600' }]}>Mask Exact Street Pin</Text>
                <Text style={[type.caption, { color: ui.secondaryLabel }]}>
                  Keep your exact building private. Shoppers only see your general neighborhood.
                </Text>
              </View>
              <Switch
                value={maskLocation}
                onValueChange={setMaskLocation}
                trackColor={{ false: 'rgba(255,255,255,0.2)', true: ui.accent }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.actions, { borderTopColor: ui.separator, backgroundColor: ui.background }]}>
        <PrimaryButton
          label={isSaving ? 'Uploading & Saving...' : 'Save Storefront & Banner'}
          onPress={handleSave}
          disabled={isSaving || !name.trim()}
          loading={isSaving}
        />
      </View>

      <UploadSheet
        visible={activeSlot !== null}
        onClose={() => setActiveSlot(null)}
        onCamera={() => handlePick('camera')}
        onGallery={() => handlePick('library')}
        title={activeSlot === 'logo' ? 'Upload store logo' : 'Upload store banner'}
      />
    </ScreenContainer>
  );
}

function BannerDropzone({
  image,
  existingUrl,
  onPress,
  ui,
}: {
  image: PickedImage | null;
  existingUrl: string | null;
  onPress: () => void;
  ui: any;
}) {
  const displayUri = image?.uri || existingUrl;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.bannerDropzone,
        continuous,
        {
          borderRadius: corner.lg,
          backgroundColor: ui.card,
          borderColor: ui.separator,
          borderWidth: 1,
        },
        pressed && { opacity: 0.85 },
      ]}>
      {displayUri ? (
        <>
          <Image source={{ uri: displayUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <View style={styles.overlayShade} />
          <View style={[styles.changePill, continuous, { borderRadius: corner.pill }]}>
            <Ionicons name="camera" size={14} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>Change Banner</Text>
          </View>
        </>
      ) : (
        <View style={styles.emptyWrap}>
          <View style={[styles.iconCircle, continuous, { borderRadius: corner.md, backgroundColor: 'rgba(255, 159, 10, 0.14)' }]}>
            <Ionicons name="image-outline" size={26} color={ui.accent} />
          </View>
          <Text style={[type.subhead, { color: ui.label, fontWeight: '700' }]}>Upload Store Banner</Text>
          <Text style={[type.caption, { color: ui.secondaryLabel }]}>Tap to choose a wide header cover image</Text>
        </View>
      )}
    </Pressable>
  );
}

function LogoDropzone({
  image,
  existingUrl,
  onPress,
  ui,
}: {
  image: PickedImage | null;
  existingUrl: string | null;
  onPress: () => void;
  ui: any;
}) {
  const displayUri = image?.uri || existingUrl;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.logoDropzone,
        continuous,
        {
          borderRadius: 44,
          backgroundColor: ui.card,
          borderColor: ui.separator,
          borderWidth: 1,
        },
        pressed && { opacity: 0.85 },
      ]}>
      {displayUri ? (
        <>
          <Image source={{ uri: displayUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <View style={styles.logoOverlayShade} />
          <View style={styles.logoCameraBadge}>
            <Ionicons name="camera" size={13} color="#FFFFFF" />
          </View>
        </>
      ) : (
        <View style={styles.emptyLogoWrap}>
          <Ionicons name="camera-outline" size={24} color={ui.accent} />
          <Text style={{ color: ui.secondaryLabel, fontSize: 10, fontWeight: '700', marginTop: 2 }}>LOGO</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40, paddingHorizontal: 16 },
  form: { gap: 18 },
  sectionBlock: { gap: 8 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  bannerDropzone: {
    height: 150,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoDropzone: {
    width: 88,
    height: 88,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayShade: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.30)',
  },
  changePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  emptyWrap: {
    alignItems: 'center',
    gap: 4,
  },
  iconCircle: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  logoOverlayShade: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  logoCameraBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyLogoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 12,
  },
  actions: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
