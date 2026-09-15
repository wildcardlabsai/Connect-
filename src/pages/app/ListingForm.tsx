import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/app/DashboardLayout';
import { SelectField, TextAreaField, TextField } from '../../components/forms/Fields';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../lib/auth';
import {
  createListing,
  fetchListing,
  listingPhotoUrl,
  updateListing,
  uploadListingPhoto,
} from '../../lib/api/listings';
import type { Frequency, Listing } from '../../lib/database.types';
import { materialCategories, otherCategory } from '../../data/materials';
import { compact, requiredText } from '../../lib/validation';
import type { Errors } from '../../lib/validation';
import { useSeo } from '../../lib/seo';
import '../../components/forms/form.css';

const CATEGORY_OPTIONS = [...materialCategories, otherCategory].map((c) => c.name);
const CATEGORY_BY_NAME = new Map([...materialCategories, otherCategory].map((c) => [c.name, c.id]));
const CATEGORY_NAME_BY_ID = new Map([...materialCategories, otherCategory].map((c) => [c.id, c.name]));

const FREQUENCY_LABELS: Record<Frequency, string> = {
  'one-off': 'One-off',
  occasional: 'Occasional',
  regular: 'Regular',
};

type FieldName = 'category' | 'title' | 'description' | 'quantity' | 'condition' | 'location' | 'frequency';

const EMPTY: Record<FieldName, string> = {
  category: '',
  title: '',
  description: '',
  quantity: '',
  condition: '',
  location: '',
  frequency: '',
};

export default function ListingForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const { user, mode } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Errors<FieldName>>({});
  const [existing, setExisting] = useState<Listing | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [photoPaths, setPhotoPaths] = useState<string[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useSeo({
    title: `${isEdit ? 'Edit Listing' : 'New Listing'} | ConnectCymru`,
    description: 'List surplus material on ConnectCymru.',
    path: isEdit ? `/app/listings/${id}/edit` : '/app/listings/new',
  });

  useEffect(() => {
    if (!isEdit || !id) return;
    fetchListing(id).then((listing) => {
      if (!listing) return;
      setExisting(listing);
      setValues({
        category: CATEGORY_NAME_BY_ID.get(listing.category_id) ?? '',
        title: listing.title,
        description: listing.description,
        quantity: listing.quantity ?? '',
        condition: listing.condition ?? '',
        location: listing.location ?? '',
        frequency: listing.frequency ? FREQUENCY_LABELS[listing.frequency] : '',
      });
      setPhotoPaths(listing.photo_paths);
      setLoading(false);
    });
  }, [isEdit, id]);

  const set = (field: FieldName) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  };

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList) return;
    setPendingFiles((current) => [...current, ...Array.from(fileList)]);
  }

  function removePendingFile(index: number) {
    setPendingFiles((current) => current.filter((_, i) => i !== index));
  }

  /** Removes an already-uploaded photo from the listing. The file itself is
      left in storage (harmless and orphaned rather than risking a delete
      race with a concurrent save) but stops being shown or saved against
      this listing once the form is submitted. */
  function removeExistingPhoto(path: string) {
    setPhotoPaths((current) => current.filter((p) => p !== path));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setFormError(null);

    const found = compact<FieldName>({
      category: values.category ? undefined : 'Choose a category.',
      title: requiredText(values.title, 'Title'),
      description: requiredText(values.description, 'Description'),
      frequency: values.frequency ? undefined : 'Choose how often this is available.',
    });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const categoryId = CATEGORY_BY_NAME.get(values.category) ?? 'other';
      const frequency = (Object.entries(FREQUENCY_LABELS).find(([, label]) => label === values.frequency)?.[0] ??
        'one-off') as Frequency;

      const input = {
        category_id: categoryId,
        title: values.title.trim(),
        description: values.description.trim(),
        quantity: values.quantity.trim(),
        condition: values.condition.trim(),
        location: values.location.trim(),
        frequency,
      };

      const listing = isEdit && existing ? await updateListing(existing.id, input) : await createListing(user.id, input);

      const removedExisting = isEdit && existing
        ? existing.photo_paths.some((path) => !photoPaths.includes(path))
        : false;

      if (pendingFiles.length > 0 || removedExisting) {
        const uploaded = await Promise.all(pendingFiles.map((file) => uploadListingPhoto(user.id, listing.id, file)));
        await updateListing(listing.id, { photo_paths: [...photoPaths, ...uploaded] });
      }

      navigate('/app/listings');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Something went wrong saving this listing.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Edit Listing">
        <p className="lead">Loading&hellip;</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={isEdit ? 'Edit Listing' : 'New Listing'}>
      <form className="form" style={{ maxWidth: '40rem' }} onSubmit={handleSubmit} noValidate>
        <TextField
          label="Title"
          name="title"
          value={values.title}
          onChange={set('title')}
          error={errors.title}
          required
          hint="A short, specific name, e.g. &ldquo;Kiln-dried oak offcuts, 20-40mm&rdquo;."
        />

        <SelectField
          label="Category"
          name="category"
          value={values.category}
          onChange={set('category')}
          error={errors.category}
          options={CATEGORY_OPTIONS}
          required
        />

        <TextAreaField
          label="Description"
          name="description"
          value={values.description}
          onChange={set('description')}
          error={errors.description}
          required
          hint="What it is, where it comes from, and anything a buyer would want to know before asking."
        />

        <div className="form__grid form__grid--2">
          <TextField
            label="Quantity"
            name="quantity"
            value={values.quantity}
            onChange={set('quantity')}
            hint="e.g. 2 pallets, 400kg, 15 sheets."
          />
          <TextField
            label="Condition"
            name="condition"
            value={values.condition}
            onChange={set('condition')}
            hint="e.g. unused, lightly used, offcuts."
          />
        </div>

        <div className="form__grid form__grid--2">
          <TextField
            label="Location"
            name="location"
            value={values.location}
            onChange={set('location')}
            hint="Town or area."
          />
          <SelectField
            label="Availability"
            name="frequency"
            value={values.frequency}
            onChange={set('frequency')}
            error={errors.frequency}
            options={Object.values(FREQUENCY_LABELS)}
            required
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="listing-photos">
            Photographs <span className="field__optional">(optional)</span>
          </label>
          {mode === 'claude-db' ? (
            <p className="field__hint">Photo uploads aren&rsquo;t available in this demo mode.</p>
          ) : (
            <>
              <p className="field__hint">Photographs of the material as it stands.</p>
              <input
                id="listing-photos"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => handleFilesSelected(event.target.files)}
              />
            </>
          )}

          {mode !== 'claude-db' && (photoPaths.length > 0 || pendingFiles.length > 0) && (
            <ul className="photo-picker">
              {photoPaths.map((path) => (
                <li key={path} className="photo-picker__item">
                  <img src={listingPhotoUrl(path)} alt="" />
                  <button type="button" className="photo-picker__remove" onClick={() => removeExistingPhoto(path)}>
                    Remove
                  </button>
                </li>
              ))}
              {pendingFiles.map((file, index) => (
                <li key={`${file.name}-${index}`} className="photo-picker__item">
                  <img src={URL.createObjectURL(file)} alt="" />
                  <button type="button" className="photo-picker__remove" onClick={() => removePendingFile(index)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {formError ? (
          <p className="form__alert" role="alert">
            {formError}
          </p>
        ) : null}

        <div className="form__foot">
          <Button type="submit" variant="accent" size="lg" disabled={submitting}>
            {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Publish listing'}
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
}
