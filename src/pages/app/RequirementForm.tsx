import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/app/DashboardLayout';
import { SelectField, TextAreaField, TextField } from '../../components/forms/Fields';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../lib/auth';
import { createRequirement, updateRequirement } from '../../lib/api/requirements';
import { supabase } from '../../lib/supabase';
import type { Requirement } from '../../lib/database.types';
import { materialCategories, otherCategory } from '../../data/materials';
import { compact, requiredText } from '../../lib/validation';
import type { Errors } from '../../lib/validation';
import { useSeo } from '../../lib/seo';
import '../../components/forms/form.css';

const CATEGORY_OPTIONS = [...materialCategories, otherCategory].map((c) => c.name);
const CATEGORY_BY_NAME = new Map([...materialCategories, otherCategory].map((c) => [c.name, c.id]));
const CATEGORY_NAME_BY_ID = new Map([...materialCategories, otherCategory].map((c) => [c.id, c.name]));

type FieldName = 'category' | 'title' | 'description' | 'quantityNeeded' | 'locationPreference';

const EMPTY: Record<FieldName, string> = {
  category: '',
  title: '',
  description: '',
  quantityNeeded: '',
  locationPreference: '',
};

export default function RequirementForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Errors<FieldName>>({});
  const [existing, setExisting] = useState<Requirement | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useSeo({
    title: `${isEdit ? 'Edit Requirement' : 'New Requirement'} | ConnectCymru`,
    description: 'Describe a material your business is looking for.',
    path: isEdit ? `/app/requirements/${id}/edit` : '/app/requirements/new',
  });

  useEffect(() => {
    if (!isEdit || !id) return;
    supabase
      .from('requirements')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        const requirement = data as Requirement | null;
        if (!requirement) return;
        setExisting(requirement);
        setValues({
          category: CATEGORY_NAME_BY_ID.get(requirement.category_id) ?? '',
          title: requirement.title,
          description: requirement.description,
          quantityNeeded: requirement.quantity_needed ?? '',
          locationPreference: requirement.location_preference ?? '',
        });
        setLoading(false);
      });
  }, [isEdit, id]);

  const set = (field: FieldName) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setFormError(null);

    const found = compact<FieldName>({
      category: values.category ? undefined : 'Choose a category.',
      title: requiredText(values.title, 'Title'),
      description: requiredText(values.description, 'Description'),
    });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const input = {
        category_id: CATEGORY_BY_NAME.get(values.category) ?? 'other',
        title: values.title.trim(),
        description: values.description.trim(),
        quantity_needed: values.quantityNeeded.trim(),
        location_preference: values.locationPreference.trim(),
      };

      if (isEdit && existing) {
        await updateRequirement(existing.id, input);
      } else {
        await createRequirement(user.id, input);
      }

      navigate('/app/requirements');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Something went wrong saving this.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Edit Requirement">
        <p className="lead">Loading&hellip;</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={isEdit ? 'Edit Requirement' : 'New Requirement'}>
      <form className="form" style={{ maxWidth: '40rem' }} onSubmit={handleSubmit} noValidate>
        <TextField
          label="Title"
          name="title"
          value={values.title}
          onChange={set('title')}
          error={errors.title}
          required
          hint="A short, specific name, e.g. &ldquo;Softwood offcuts, any length&rdquo;."
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
          hint="What you need it for, grade, tolerance, and anything that decides suitability."
        />

        <div className="form__grid form__grid--2">
          <TextField
            label="Quantity needed"
            name="quantityNeeded"
            value={values.quantityNeeded}
            onChange={set('quantityNeeded')}
            hint="e.g. up to 500kg a month."
          />
          <TextField
            label="Location preference"
            name="locationPreference"
            value={values.locationPreference}
            onChange={set('locationPreference')}
            hint="Town, area, or how far you can collect from."
          />
        </div>

        {formError ? (
          <p className="form__alert" role="alert">
            {formError}
          </p>
        ) : null}

        <div className="form__foot">
          <Button type="submit" variant="accent" size="lg" disabled={submitting}>
            {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Post requirement'}
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
}
