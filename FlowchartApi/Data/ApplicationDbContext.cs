using FlowchartApi.Models;
using Microsoft.EntityFrameworkCore;

namespace FlowchartApi.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<DiagramModel> Diagrams { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<DiagramModel>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.JsonData).HasColumnType("jsonb");
                entity.HasIndex(e => e.Name);
                entity.HasIndex(e => e.CreatedAt);
            });
        }
    }
}
