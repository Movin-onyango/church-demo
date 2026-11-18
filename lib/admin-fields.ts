// lib/admin-fields.ts
export type FieldType = 'text' | 'textarea' | 'number' | 'boolean' | 'date' | 'time' | 'select';

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  required?: boolean;
  helpText?: string;
  defaultValue?: string | number | boolean;
};

export type TableConfig = {
  table: string;
  label: string;
  fields: Field[];
  listColumns: string[]; // field names shown in the table list
  orderBy?: { column: string; ascending: boolean };
};

export const ADMIN_TABLES: Record<string, TableConfig> = {
  services: {
    table: 'service_times',
    label: 'Service Times',
    orderBy: { column: 'display_order', ascending: true },
    listColumns: ['name', 'day_of_week', 'start_time', 'end_time', 'language'],
    fields: [
      { name: 'name', label: 'Service Name', type: 'text', required: true },
      { name: 'day_of_week', label: 'Day of Week', type: 'select', required: true,
        options: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(d => ({ value: d, label: d })) },
      { name: 'start_time', label: 'Start Time', type: 'time', required: true },
      { name: 'end_time', label: 'End Time', type: 'time' },
      { name: 'language', label: 'Language', type: 'text', helpText: 'e.g. English, Swahili, Mixed' },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'display_order', label: 'Display Order', type: 'number', defaultValue: 0 },
      { name: 'is_active', label: 'Active', type: 'boolean', defaultValue: true },
    ],
  },
  visit: {
    table: 'visit_info',
    label: 'Visit Info',
    orderBy: { column: 'display_order', ascending: true },
    listColumns: ['card_key', 'title'],
    fields: [
      { name: 'card_key', label: 'Card Key (unique)', type: 'text', required: true, helpText: 'e.g. parking, kids, dress_code' },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'body', label: 'Body', type: 'textarea', required: true },
      { name: 'icon', label: 'Icon', type: 'text' },
      { name: 'display_order', label: 'Display Order', type: 'number', defaultValue: 0 },
      { name: 'is_active', label: 'Active', type: 'boolean', defaultValue: true },
    ],
  },
  about: {
    table: 'about_sections',
    label: 'About Page',
    orderBy: { column: 'display_order', ascending: true },
    listColumns: ['section_key', 'title'],
    fields: [
      { name: 'section_key', label: 'Section Key', type: 'text', required: true, helpText: 'e.g. story, mission, what_to_expect' },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'body', label: 'Body', type: 'textarea', required: true },
      { name: 'display_order', label: 'Display Order', type: 'number', defaultValue: 0 },
      { name: 'is_active', label: 'Active', type: 'boolean', defaultValue: true },
    ],
  },
  sermons: {
    table: 'sermons',
    label: 'Sermons',
    orderBy: { column: 'sermon_date', ascending: false },
    listColumns: ['title', 'preacher', 'sermon_date', 'is_featured'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'preacher', label: 'Preacher', type: 'text' },
      { name: 'sermon_date', label: 'Sermon Date', type: 'date', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'youtube_video_id', label: 'YouTube Video ID', type: 'text', helpText: 'Just the ID, e.g. dQw4w9WgXcQ' },
      { name: 'audio_url', label: 'Audio MP3 URL', type: 'text' },
      { name: 'audio_size_mb', label: 'Audio Size (MB)', type: 'number' },
      { name: 'thumbnail_url', label: 'Thumbnail URL', type: 'text' },
      { name: 'is_featured', label: 'Featured', type: 'boolean', defaultValue: false },
      { name: 'is_published', label: 'Published', type: 'boolean', defaultValue: true },
    ],
  },
  announcements: {
    table: 'announcements',
    label: 'Announcements',
    orderBy: { column: 'created_at', ascending: false },
    listColumns: ['title', 'priority', 'is_published'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'body', label: 'Body', type: 'textarea', required: true },
      { name: 'priority', label: 'Priority', type: 'select', required: true,
        options: [
          { value: 'normal', label: 'Normal' },
          { value: 'important', label: 'Important' },
          { value: 'urgent', label: 'Urgent' },
        ], defaultValue: 'normal' },
      { name: 'expires_at', label: 'Expires At', type: 'date' },
      { name: 'is_published', label: 'Published', type: 'boolean', defaultValue: true },
    ],
  },
  groups: {
    table: 'small_groups',
    label: 'Small Groups',
    orderBy: { column: 'area', ascending: true },
    listColumns: ['name', 'area', 'leader_name'],
    fields: [
      { name: 'name', label: 'Group Name', type: 'text', required: true },
      { name: 'area', label: 'Area / Ward', type: 'text', required: true, helpText: 'e.g. Kilimani, Ruiru' },
      { name: 'meeting_day', label: 'Meeting Day', type: 'text' },
      { name: 'meeting_time', label: 'Meeting Time', type: 'text' },
      { name: 'leader_name', label: 'Leader Name', type: 'text' },
      { name: 'whatsapp_number', label: 'WhatsApp Number', type: 'text', helpText: 'Digits only, e.g. 254700000000' },
      { name: 'is_active', label: 'Active', type: 'boolean', defaultValue: true },
    ],
  },
  giving: {
    table: 'giving_sections',
    label: 'Giving Impact',
    orderBy: { column: 'display_order', ascending: true },
    listColumns: ['title'],
    fields: [],
  },
  nav: {
    table: 'nav_links',
    label: 'Nav Links',
    orderBy: { column: 'display_order', ascending: true },
    listColumns: ['label', 'href'],
    fields: [
      { name: 'label', label: 'Label', type: 'text', required: true },
      { name: 'href', label: 'Link (href)', type: 'text', required: true },
      { name: 'display_order', label: 'Display Order', type: 'number', defaultValue: 0 },
      { name: 'is_active', label: 'Active', type: 'boolean', defaultValue: true },
    ],
  },
};