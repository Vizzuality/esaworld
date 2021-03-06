class DataLayer < ActiveRecord::Base
  has_enumeration_for :import_status, with: ImportStatus, create_helpers: true

  include CartoDb

  REQUIRED_HEADERS = []

  belongs_to :page

  path = Rails.env.development? ? ":rails_root/public/system/:attachment/:filename" : "/:attachment/:filename"

  has_attached_file :shapefile, :path => path
  validates_attachment_content_type :shapefile,
    content_type: ["text/csv",
                    "application/vnd.ms-excel",
                    "application/zip",
                    "application/x-compressed",
                    "application/x-zip-compressed",
                    "application/x-gzip-compressed",
                    "application/vnd.google-earth.kml+xml",
                    "image/tiff",
                    "application/gpx",
                    "application/gpx+xml",
                    "application/octet-stream"] #for .shp files



  validates :shapefile, attachment_presence: true, on: :create

  attr_accessor :cloning

  before_save :check_is_ready
  before_destroy :remove_cartodb_table

  private

  def check_is_ready
    if self.import_status == ImportStatus::COMPLETE
      if (self.raster_type.blank? && (!self.layer_column.blank? || !self.year.blank?))
          self.is_ready = true
      elsif (!self.raster_categories.blank?)
        self.is_ready = true
      else
        self.is_ready = false
      end
    end
    true
  end

  def remove_cartodb_table
    layers_same_table = DataLayer.where.not(id: self.id).where(table_name: self.table_name)
    if layers_same_table.empty?
      puts "Deleting cartodb table #{self.table_name}"
      CartoDb.remove_cartodb_table(self.table_name)
    end
  end

end
